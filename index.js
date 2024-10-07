const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const https = require('https');
const FormData = require('form-data');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { EmbedBuilder } = require('discord.js');

var sqlinfo = require('./database/userinfo.json');
var mysql = require('mysql');

const SQLpool = mysql.createPool({
    host: sqlinfo.host,
    user: sqlinfo.user,
    password: sqlinfo.password,
    database: sqlinfo.database
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, 'MessageContent', 'GuildMessages'] });

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
});

/*********************************************Message Detection********************************************************* */


client.on(Events.MessageCreate, async (message) => {
    // console.log(message.attachments.size);
    if (message.author.bot) return;
    message.attachments.forEach(item => {
        if(item.contentType === 'audio/ogg'){
            var id = item.id
            var url = item.url;
            https.get(url, (res) => {
                const relative_path = `./tmp/audio/${id}.ogg`;
                const relative_path_wav = `./tmp/audio/${id}.wav`;
                const writeStream = fs.createWriteStream(relative_path);
                res.pipe(writeStream);
                writeStream.on("finish", () => {
                    writeStream.close();
                    // console.log("Download Completed!");

                    ffmpeg(relative_path)
                    .toFormat('wav')
                    .on('error', (err) => {
                        console.log('An error occurred: ' + err.message);
                    })
                    .on('end', () => {
                        // console.log('Processing finished !');

                        target_url = "http://127.0.0.1:9977/api"

                        var msg = 'The voice message has been converted to text:\n\nChinese version:\n\`';
                        const formData = new FormData();
                        formData.append('file', fs.createReadStream(path.resolve(__dirname, relative_path_wav)));
                        formData.append('language', 'zh');
                        formData.append('model', 'large-v2');
                        formData.append('response_format', 'text');
                        axios({
                            method: 'post',
                            url: target_url,
                            data: formData,
                            headers: {
                                ...formData.getHeaders(),
                            },
                            timeout: 60000
                        })
                        .then(response => {
                            msg += response.data['data'] + '\`'
                            const formData = new FormData();
                            formData.append('file', fs.createReadStream(path.resolve(__dirname, relative_path_wav)));
                            formData.append('language', 'zh');
                            formData.append('model', 'distil-large-v3');
                            formData.append('response_format', 'text');
                            axios({
                                method: 'post',
                                url: target_url,
                                data: formData,
                                headers: {
                                    ...formData.getHeaders(),
                                },
                                timeout: 60000
                            }).then(response => {
                                msg += '\n\nEnglish version:\n\`' + response.data['data'] + '\`'
                                message.reply(msg);
                                fs.unlink(path.resolve(__dirname, relative_path),(err) => {
                                    if (err) {
                                        console.error('Error deleting file:', err);
                                        return;
                                    }
                                    // console.log('File deleted successfully');
                                });
                                fs.unlink(path.resolve(__dirname, relative_path_wav),(err) => {
                                    if (err) {
                                        console.error('Error deleting file:', err);
                                        return;
                                    }
                                    // console.log('File deleted successfully');
                                });
                            })
                            .catch(error => {
                                console.error(error);
                            });
                        })
                        .catch(error => {
                            console.error(error);
                        });
                    })
                    .save(relative_path_wav);
                })
            })
        }
    });
})


/************************************************Interaction*************************************************************/

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

/********************************Voice channel track********************************************************** */

client.on('voiceStateUpdate', (oldState, newState) => {
    var guildId = oldState.guild.id;
    function getDateTime(timestamp, timezone){
        let tmp = new Date(timestamp);
        return `\`${new Date(tmp.setHours(tmp.getHours() + timezone)).toISOString().slice(0, 19).replace('T',' ')}\`` + `***(GMT ${timezone > 0 ? `+${timezone}`: timezone})***`;
    }
    function formatSec(sec){
        let date = new Date(null);
        date.setSeconds(sec);
        return date.toISOString().slice(11, 19);
    }
    SQLpool.query(`SELECT channelId from channel_table WHERE guildId='${guildId}'`, function (error, results, fields) {
        if(results.length){
            let timestamp = Date.now();
            let userId=oldState.id;
            let log_channel = results[0].channelId;
            
            client.users.fetch(userId).then(function(user){
                var msg = `**User: **${user.username}\n**ID: **${user.id} ${user}\n**At: **`;
                // console.log(user);
                // console.log(log_channel);
                if (oldState.channelId === null){
                    try{
                        SQLpool.query(`INSERT INTO voice_table (guildId, userId, timestamp, status) VALUES ('${guildId}','${userId}','${timestamp}', 0)`, function (error, results, fields) {
                            if(error) console.log(error);
                            // console.log(user);
                            //var msg = `User \`${user.username}\` ***joined*** voice channel at:\n`;
                            SQLpool.query(`SELECT timezone FROM timezone_table WHERE guildId='${guildId}';`,  function (error, results, fields){
                                // console.log(results)
                                if(results.length)
                                    results.forEach(item => {
                                        msg = msg + '\n' + getDateTime(timestamp, item.timezone);
                                    });
                                else msg = msg + '\n' + getDateTime(timestamp, 8);

                                const embedMsg = new EmbedBuilder()
                                    .setColor(0x6EC207)
                                    .setTitle('[Join Voice Channel]')
                                    .setThumbnail(user.displayAvatarURL())
                                    .setDescription(msg)
                                    .setTimestamp()
                                    .setFooter({ text: 'Voice Channel Logger', iconURL: client.user.displayAvatarURL() });
                                // interaction.reply({embeds: [exampleEmbed]})
                                client.channels.cache.get(log_channel).send({embeds: [embedMsg]});
                            });
                        });
                    } catch(e){
                        console.log(e);
                    }
                }
                else if (newState.channelId === null){
                    SQLpool.query(`SELECT timestamp FROM voice_table WHERE guildId='${guildId}' AND userId='${userId}'`, function (error, results, fields) {
                        if(results.length == 0) return;
                        let last_time = results[results.length - 1].timestamp;
                        let duration = formatSec((timestamp - last_time)/1000);
                        SQLpool.query(`SELECT timezone FROM timezone_table WHERE guildId='${guildId}';`,  function (error, results, fields){
                            if(results.length)
                                results.forEach(item => {
                                    msg = msg + '\n' + getDateTime(timestamp, item.timezone);
                                });
                                else msg = msg + '\n' + getDateTime(timestamp, 8);

                                msg = msg + `\nThe duration of the voice chat is \`${duration}\`!`;
                                const embedMsg = new EmbedBuilder()
                                    .setColor(0xB8001F)
                                    .setTitle('[Join Voice Channel]')
                                    .setThumbnail(user.displayAvatarURL())
                                    .setDescription(msg)
                                    .setTimestamp()
                                    .setFooter({ text: 'Voice Channel Logger', iconURL: client.user.displayAvatarURL() });
                                    SQLpool.query(`INSERT INTO voice_table (guildId, userId, timestamp, status) VALUES ('${guildId}','${userId}','${timestamp}', 1)`, function (error, results, fields) {
                                    
                                        client.channels.cache.get(log_channel).send({embeds: [embedMsg]});
                                    })
                                //client.channels.cache.get(log_channel).send(msg);
                        });
                    });
                }
                else return;
            });
        }
    });
});

client.login(token);