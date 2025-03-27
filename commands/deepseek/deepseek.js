const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const ollama = require('ollama').default
const removeThinkTag = require('../../utils/deepseek/removeThinkTag')
const markdownThinkTag = require('../../utils/deepseek/markdownThinkTag')
const deepReply = require('../../utils/deepseek/reply')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chat')
		.setDescription('Ask something to Gemma3!')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('your input')
                .setRequired(true)),
	async execute(interaction, SQLpool) {
		const guildId = interaction.guildId ?? -1;
        const userId = interaction.user.id;
        const mentionPattern = `<@${interaction.applicationId}>`;
        const regex = new RegExp(mentionPattern);
        var text = interaction.options.getString('text').replace(regex, '');
        if(!text.length){
            interaction.reply('Please input something!');
            return;
        }
        SQLpool.query(`SELECT id,conversationId from deepseek WHERE guildId='${guildId}' AND userId='${userId}'`, function (error, results, fields) {
            if(results.length){
                var id = results[0].id;
                var conversationId = results[0].conversationId;
                SQLpool.query(`SELECT think, content from deepseektable${id} WHERE id=${conversationId}`, function (error, results, fields) {
                    if(results.length){
                        let msg = JSON.parse(results[0].content);
                        let think = results[0].think;
                        msg.push({'role': 'user', 'content': text});
                        /*axios.post('http://100.90.99.3:9999/api', { data: msg, timeout: 60000 })
                        .then(response => {
                            let data = response.data['data'];
                            let responseData = data[data.length - 1]['content'];
                            //console.log(responseData);
                            msg = removeThinkTag(data);
                            msg = JSON.stringify(msg);
                            deepReply(interaction, responseData, think);
                            //console.log(msg);
                            SQLpool.query(`UPDATE deepseektable${id} SET content = ? WHERE id=${conversationId};`,
                                [msg], function (error, results, fields) {
                                    if(!results) interaction.reply('Error while update conversation!');
                            });
                        })
                        .catch(error => {
                            console.error('HTTP Error:', error);
                        });*/
                        ollama.chat({model: 'gemma3:27b', messages: msg})
                        .then(response => {
                            let responseData = response.message.content;
                            //console.log(response.message)
                            //console.log(responseData);
                            //msg = removeThinkTag(data);
                            //console.log(msg)
                            msg.push({'role': 'assistant', 'content': responseData})
                            msg = JSON.stringify(msg)
                            deepReply(interaction, responseData, 0);
                            //console.log(msg);
                            SQLpool.query(`UPDATE deepseektable${id} SET content = ? WHERE id=${conversationId};`,
                                [msg], function (error, results, fields) {
                                    if(!results) interaction.reply('Error while update conversation!');
                            });
                        })
                        .catch(error => {
                            console.error('OLLAMA Error:', error);
                        });
                    }
                    else{
                        let msg = [];
                        msg.push({'role': 'user', 'content': text});
                        /*axios.post('http://100.90.99.3:9999/api', { data: msg, timeout: 60000 })
                        .then(response => {
                            let data = response.data['data'];
                            let responseData = data[data.length - 1]['content'];
                            deepReply(interaction, responseData, 1);
                            msg = removeThinkTag(data);
                            msg = JSON.stringify(msg)
                            // console.log(`${msg}`)
                            SQLpool.query(`INSERT INTO deepseektable${id} (name, think, content) VALUES (?,?,?)`,
                                ['New Conversation', 1, msg], function (error, results, fields) {
                                    if(!results) interaction.reply('Error when creating new conversation!');
                                    else SQLpool.query(`UPDATE deepseek SET conversationId='${results.insertId}' WHERE guildId='${guildId}' AND userId='${userId}'`,
                                        function (error, results, fields) { if(!results) interaction.reply('Error when creating new conversation!');});
                            });
                        })
                        .catch(error => {
                            console.error('HTTP Error:', error);
                        });*/
                        ollama.chat({model: 'gemma3:27b', messages: msg})
                        .then(response => {
                            let responseData = response.message.content;
                            //console.log(responseData);
                            //msg = removeThinkTag(data);
                            msg = JSON.stringify(msg)
                            deepReply(interaction, responseData, 0);
                            //console.log(msg);
                            
                            SQLpool.query(`INSERT INTO deepseektable${id} (name, think, content) VALUES (?,?,?)`,
                                ['New Conversation', 1, msg], function (error, results, fields) {
                                    if(!results) interaction.reply('Error when creating new conversation!');
                                    else SQLpool.query(`UPDATE deepseek SET conversationId='${results.insertId}' WHERE guildId='${guildId}' AND userId='${userId}'`,
                                        function (error, results, fields) { if(!results) interaction.reply('Error when creating new conversation!');});
                            });
                        })
                        .catch(error => {
                            console.error('OLLAMA Error:', error);
                        });
                    }
                });
            }
            else{
                SQLpool.query(`INSERT INTO deepseek (userId, guildId, conversationId) VALUES ('${userId}', '${guildId}', 1);`, function (error, results, fields) {
                    // console.log(results.insertId);
                    var insertId = results.insertId;
                    SQLpool.query(`CREATE TABLE deepseektable${insertId} (id int NOT NULL AUTO_INCREMENT,name varchar(45) NULL,think int NULL,content json NULL,PRIMARY KEY (id));`,function (error, results, fields) {
                        if(results){
                            let msg = [];
                            msg.push({'role': 'user', 'content': text});
                            /*axios.post('http://100.90.99.3:9999/api', { data: msg, timeout: 60000 })
                            .then(response => {
                                let data = response.data['data'];
                                let responseData = data[data.length - 1]['content'];
                                deepReply(interaction, responseData, 1);
                                msg = removeThinkTag(data);
                                msg = JSON.stringify(msg)
                                // console.log(`${msg}`)
                                SQLpool.query(`INSERT INTO deepseektable${insertId} (name, think, content) VALUES (?,?,?)`,
                                    ['New Conversation', 1, msg], function (error, results, fields) {
                                        if(!results) interaction.reply('Error when creating new conversation!');
                                });
                            })
                            .catch(error => {
                                console.error('HTTP Error:', error);
                            });*/
                            ollama.chat({model: 'gemma3:27b', messages: msg})
                            .then(response => {
                                let responseData = response.message.content;
                                //console.log(responseData);
                                //msg = removeThinkTag(data);
                                msg = JSON.stringify(msg)
                                deepReply(interaction, responseData, 0);
                                //console.log(msg);
                                SQLpool.query(`INSERT INTO deepseektable${insertId} (name, think, content) VALUES (?,?,?)`,
                                    ['New Conversation', 1, msg], function (error, results, fields) {
                                        if(!results) interaction.reply('Error when creating new conversation!');
                                });
                            })
                            .catch(error => {
                                console.error('OLLAMA Error:', error);
                            });
                        }
                        else interaction.reply('Error when creating new database!');
                    })
                });
            }
        });
	},
};