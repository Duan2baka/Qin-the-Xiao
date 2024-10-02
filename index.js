const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const https = require('https');
const FormData = require('form-data');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');

var sqlinfo = require('./database/userinfo.json');
var mysql = require('mysql');

const SQLpool = mysql.createPool({
    host: sqlinfo.host,
    user: sqlinfo.user,
    password: sqlinfo.password,
    database: sqlinfo.database
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, 'MessageContent', 'GuildMessages'] });

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

client.login(token);