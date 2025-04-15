const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const ollama = require('ollama').default
const removeThinkTag = require('../../utils/chat/removeThinkTag')
const markdownThinkTag = require('../../utils/chat/markdownThinkTag')
const getReply = require('../../utils/chat/reply').getReply
require('dotenv').config()

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
        interaction.deferReply({ephemeral: true});
        if(!text.length){
            interaction.reply('Please input something!');
            return;
        }
        SQLpool.query(`SELECT id,conversationId from chatbot WHERE guildId='${guildId}' AND userId='${userId}'`, function (error, results, fields) {
            if(results.length){
                var id = results[0].id;
                var conversationId = results[0].conversationId;
                SQLpool.query(`SELECT think, content from chatbot${id} WHERE id=${conversationId}`, function (error, results, fields) {
                    if(results.length){
                        let msg = JSON.parse(results[0].content);
                        let think = results[0].think;
                        msg.push({'role': 'user', 'content': text});
                        ollama.chat({model: process.env.CHATBOT, messages: msg})
                        .then(response => {
                            let responseData = response.message.content;
                            //console.log(response.message)
                            //console.log(responseData);
                            //msg = removeThinkTag(data);
                            //console.log(msg)
                            msg.push({'role': 'assistant', 'content': responseData})
                            msg = JSON.stringify(msg)
                            interaction.editReply({...getReply(responseData, 0), ephemeral: true});
                            //console.log(msg);
                            SQLpool.query(`UPDATE chatbot${id} SET content = ? WHERE id=${conversationId};`,
                                [msg], function (error, results, fields) {
                                    if(!results) interaction.editReply('Error while update conversation!');
                            });
                        })
                        .catch(error => {
                            console.error('OLLAMA Error:', error);
                        });
                    }
                    else{
                        let msg = [];
                        msg.push({'role': 'user', 'content': text});
                        ollama.chat({model: process.env.CHATBOT, messages: msg})
                        .then(response => {
                            let responseData = response.message.content;
                            //console.log(responseData);
                            //msg = removeThinkTag(data);
                            msg = JSON.stringify(msg)
                            interaction.editReply({...getReply(responseData, 0), ephemeral: true});
                            //console.log(msg);
                            
                            SQLpool.query(`INSERT INTO chatbot${id} (name, think, content) VALUES (?,?,?)`,
                                ['New Conversation', 1, msg], function (error, results, fields) {
                                    if(!results) interaction.editReply('Error when creating new conversation!');
                                    else SQLpool.query(`UPDATE chatbot SET conversationId='${results.insertId}' WHERE guildId='${guildId}' AND userId='${userId}'`,
                                        function (error, results, fields) { if(!results) interaction.editReply('Error when creating new conversation!');});
                            });
                        })
                        .catch(error => {
                            console.error('OLLAMA Error:', error);
                        });
                    }
                });
            }
            else{
                SQLpool.query(`INSERT INTO chatbot (userId, guildId, conversationId) VALUES ('${userId}', '${guildId}', 1);`, function (error, results, fields) {
                    // console.log(results.insertId);
                    var insertId = results.insertId;
                    SQLpool.query(`CREATE TABLE chatbot${insertId} (id int NOT NULL AUTO_INCREMENT,name varchar(45) NULL,think int NULL,content json NULL,PRIMARY KEY (id));`,function (error, results, fields) {
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
                                SQLpool.query(`INSERT INTO chatbot${insertId} (name, think, content) VALUES (?,?,?)`,
                                    ['New Conversation', 1, msg], function (error, results, fields) {
                                        if(!results) interaction.reply('Error when creating new conversation!');
                                });
                            })
                            .catch(error => {
                                console.error('HTTP Error:', error);
                            });*/
                            ollama.chat({model: process.env.CHATBOT, messages: msg})
                            .then(response => {
                                let responseData = response.message.content;
                                //console.log(responseData);
                                //msg = removeThinkTag(data);
                                msg = JSON.stringify(msg)
                                interaction.editReply({...getReply(responseData, 0), ephemeral: true});
                                //console.log(msg);
                                SQLpool.query(`INSERT INTO chatbot${insertId} (name, think, content) VALUES (?,?,?)`,
                                    ['New Conversation', 1, msg], function (error, results, fields) {
                                        if(!results) interaction.editReply('Error when creating new conversation!');
                                });
                            })
                            .catch(error => {
                                console.error('OLLAMA Error:', error);
                            });
                        }
                        else interaction.editReply('Error when creating new database!');
                    })
                });
            }
        });
	},
};