require('dotenv').config()

const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const mysql = require('mysql');

const loadCommands = require('./src/loadCommands');

const SQLpool = mysql.createPool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PWD,
    database: process.env.SQL_DATABASE
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ]
});

(async () => {
    const modules = {};
    client.commands = new Collection();
    await loadCommands(client, path.join(__dirname, 'commands'), path.join(__dirname, 'src'), modules);
    const player = await modules.playerBuilder(client);

    client.once(Events.ClientReady, readyClient => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    });

    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;
        if ((!message.guild) || message.mentions.users.has(client.user.id)) return modules.bot(SQLpool, message, `<@${client.user.id}>`);
        if (message.content.startsWith('g!')) return modules.img(message);
        if(message.content.startsWith('y!')) return modules.musicPlayer(message, player);
        message.attachments.forEach(item => { if (item.contentType === 'audio/ogg') modules.stt(item, message); });
    })

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return console.error(`No command matching ${interaction.commandName} was found.`);
        try {
            await command.execute(interaction, SQLpool);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) 
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            else await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    });

    client.on('voiceStateUpdate', (oldState, newState) => { modules.voiceupdate(oldState, newState, SQLpool, client); });

    client.login(process.env.DISCORD_TOKEN);
})();
