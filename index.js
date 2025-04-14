require('dotenv').config()

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');
const { token } = require('./config.json');
const mysql = require('mysql');

const bot = require('./src/bot');
const stt = require('./src/stt');
const img = require('./src/img');
const voiceupdate = require('./src/voiceupdate');
const musicPlayer = require('./src/player/musicPlayer.js');
const playerBuilder = require('./src/player/playerBuilder.js');

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
    const player = await playerBuilder(client);

    client.commands = new Collection();
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    client.once(Events.ClientReady, readyClient => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);
        // setInterval(checkBadminton, 1000 * 60 * 60) // Runs every 1 hour
    });

    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;
        if ((!message.guild) || message.mentions.users.has(client.user.id)) return bot(SQLpool, message, `<@${client.user.id}>`);
        message.attachments.forEach(item => {
            if (item.contentType === 'audio/ogg') stt(item, message);
        });
        if (message.content.startsWith('g!')) return img(message);
        /****music player***/
        if(message.content.startsWith('y!')) return musicPlayer(message, player);
    })

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.execute(interaction, SQLpool);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    });

    client.on('voiceStateUpdate', (oldState, newState) => {
        voiceupdate(oldState, newState, SQLpool, client);
    });

    client.login(token);
})();
