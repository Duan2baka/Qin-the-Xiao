const ollama = require('ollama').default

const processString = require('../utils/sql/processString')
const removeThinkTag = require('../utils/chat/removeThinkTag')
const markdownThinkTag = require('../utils/chat/markdownThinkTag')
const deepReply = require('../utils/chat/reply').deepReply

require('dotenv').config()

async function bot(SQLpool, message, mentionPattern){
    const guildId = message.guild ? message.guild.id : -1;
    const userId = message.author.id;
    const regex = new RegExp(mentionPattern);
    var text = message.content.replace(regex, '');
    const textAttachments = message.attachments.filter(attachment => attachment.contentType === 'text/plain');
    await message.channel.sendTyping();

    if (textAttachments.size > 0) {
        let combinedContent = '';

        for (const attachment of textAttachments.values()) {
            try {
                const response = await fetch(attachment.url);
                const tmp = await response.text();
                text += '\n' +tmp; // Combine the content
            } catch (error) {
                console.error(`Error fetching attachment: ${error}`);
            }
        }
        if(!text.length){
            message.reply('Please input something!');
            return;
        }
        // console.log('Combined Content:', combinedContent);
    }

    SQLpool.query(`SELECT id,conversationId from chatbot WHERE guildId='${guildId}' AND userId='${userId}'`, function (error, results, fields) {
        if(results.length){
            var id = results[0].id;
            var conversationId = results[0].conversationId;
            SQLpool.query(`SELECT think, content from chatbot${id} WHERE id=${conversationId}`, function (error, results, fields) {
                if(results.length){
                    let msg = JSON.parse(results[0].content);
                    msg.push({'role': 'user', 'content': text});
                    ollama.chat({model: 'gemma3:27b', messages: [{ 'role':'system', 'content': process.env.GLOBAL_CONTEXT }, ...msg]})
                    .then(response => {
                        let responseData = response.message.content;
                        msg.push({'role': 'assistant', 'content': responseData})
                        msg = JSON.stringify(msg);
                        deepReply(message, responseData, 0);
                        SQLpool.query(`UPDATE chatbot${id} SET content = ? WHERE id=${conversationId};`,
                            [msg], function (error, results, fields) {
                                if(!results) message.reply('Error while update conversation!');
                        });
                    })
                    .catch(error => {
                        console.error('OLLAMA Error:', error);
                    });
                }
                else{
                    let msg = [];
                    msg.push({'role': 'user', 'content': text});
                    ollama.chat({model: 'gemma3:27b', messages: [{ 'role':'system', 'content': process.env.GLOBAL_CONTEXT }, ...msg]})
                    .then(response => {
                        let responseData = response.message.content;
                        msg = JSON.stringify(msg);
                        deepReply(message, responseData, 0);
                        
                        SQLpool.query(`INSERT INTO chatbot${id} (name, think, content) VALUES (?,?,?)`,
                            ['New Conversation', 1, msg], function (error, results, fields) {
                                if(!results) message.reply('Error when creating new conversation!');
                                else SQLpool.query(`UPDATE chatbot SET conversationId='${results.insertId}' WHERE guildId='${guildId}' AND userId='${userId}'`,
                                    function (error, results, fields) { if(!results) message.reply('Error when creating new conversation!');});
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
                var insertId = results.insertId;
                SQLpool.query(`CREATE TABLE chatbot${insertId} (id int NOT NULL AUTO_INCREMENT,name varchar(45) NULL,think int NULL,content json NULL,PRIMARY KEY (id));`,function (error, results, fields) {
                    if(results){
                        let msg = [];
                        msg.push({'role': 'user', 'content': text});
                        ollama.chat({model: 'gemma3:27b', messages: [{ 'role':'system', 'content': process.env.GLOBAL_CONTEXT }, ...msg]})
                        .then(response => {
                            let responseData = response.message.content;
                            msg = JSON.stringify(msg)
                            deepReply(message, responseData, 0);
                            SQLpool.query(`INSERT INTO chatbot${insertId} (name, think, content) VALUES (?,?,?)`,
                                ['New Conversation', 1, msg], function (error, results, fields) {
                                    if(!results) message.reply('Error when creating new conversation!');
                            });
                        })
                        .catch(error => {
                            console.error('OLLAMA Error:', error);
                        });
                    }
                    else message.reply('Error when creating new database!');
                })
            });
        }
    });
}

module.exports = bot;