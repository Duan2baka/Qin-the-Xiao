import 'dotenv/config';
import express from 'express';
import {
    InteractionType,
    InteractionResponseType,
    InteractionResponseFlags,
    MessageComponentTypes,
    ButtonStyleTypes,
    verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import { SQLpool } from './database/connect.js'
//test change
// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
/*
app.on('messageCreate',verifyKeyMiddleware(process.env.PUBLIC_KEY),  async (message) => {
    if (message.author.bot) return;
    console.log('123123123')
    if (message.content.toLowerCase().startsWith('hey google')) {
      const questions = [
        'what do you look like',
        'how old are you',
        'do you ever get tired',
        'thanks',
      ];
      const answers = [
        'Imagine the feeling of a friendly hug combined with the sound of laughter. Add a librarian’s love of books, mix in a sunny disposition and a dash of unicorn sparkles, and voila!',
        'I was launched in 2021, so I am still fairly young. But I’ve learned so much!',
        'It would be impossible to tire of our conversation.',
        'You are welcome!',
      ];
  
      // send the message and wait for it to be sent
      const confirmation = await message.channel.send(`I'm listening, ${message.author}`);
      // filter checks if the response is from the author who typed the command
      const filter = (m) => m.author.id === message.author.id;
      // set up a message collector to check if there are any responses
      const collector = confirmation.channel.createMessageCollector(filter, {
        // set up the max wait time the collector runs (optional)
        time: 60000,
      });
  
      // fires when a response is collected
      collector.on('collect', async (msg) => {
        if (msg.content.toLowerCase().startsWith('what time is it')) {
          return message.channel.send(`The current time is ${new Date().toLocaleTimeString()}.`);
        }
  
        const index = questions.findIndex((q) =>
          msg.content.toLowerCase().startsWith(q),
        );
  
        if (index >= 0) {
          return message.channel.send(answers[index]);
        }
  
        return message.channel.send(`I don't have the answer for that...`);
      });
  
      // fires when the collector is finished collecting
      collector.on('end', (collected, reason) => {
        // only send a message when the "end" event fires because of timeout
        if (reason === 'time') {
          message.channel.send(
            `${message.author}, it's been a minute without any question, so I'm no longer interested... 🙄`,
          );
        }
      });
    }
  });*/
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {

    function sendMsg(res, msg){
        res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: msg,
            },
        });
    }
    // Interaction type and data
    const { type, id, data, guild_id } = req.body;
    for(const idx in data.options) data.options[idx].value = data.options[idx].value.replaceAll(' ','').replaceAll(';','').replaceAll(',','');
    /**
     * Handle verification requests
     */
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }
    /**
     * Handle slash command requests
     * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
     */
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;
        if (name === 'love') {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    // Fetches a random emoji to send from a helper function
                    content: `Love <@duan2baka> from Swiss~ ❤`,
                },
            });
        }
        // "test" command
        if (name === 'test') {
            // Send a message into the channel where command was triggered from
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    // Fetches a random emoji to send from a helper function
                    content: `hello world ${getRandomEmoji()}`,
                },
            });
        }

        if (name === 'create' && data.options[0].value) {
            //console.log(data.options[0]);
            //console.log(`SELECT id FROM table_list WHERE list_name='${data.options[0].value}' AND guild_id='${guild_id}';`);
            var listname = data.options[0].value;
            SQLpool.query(`SELECT id FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
                //console.log(results);
                if( results.length ) sendMsg(res, `List \`${listname}\` exists!`);
                else{
                    SQLpool.query(`INSERT INTO table_list (guild_id, list_name) VALUES ('${guild_id}', '${listname}');`, function (error, results, fields) {
                        // console.log(results.insertId);
                        SQLpool.query(`CREATE TABLE table${results.insertId} (id int NOT NULL AUTO_INCREMENT, entry varchar(16) NOT NULL, PRIMARY KEY (id));`, function (error, results, fields) {
                            sendMsg(res, `List \`${listname}\` sucessfully created!`);
                        })
                    })
                }
            })
            return;
        }

        if (name === 'remove' && data.options[0].value) {
            var listname = data.options[0].value;
            SQLpool.query(`SELECT id FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
                //console.log(results);
                if( !results.length ) sendMsg(res, `List \`${listname}\` doesn't exist!`);
                else{
                    var idx = results[0].id;
                    SQLpool.query(`DELETE FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
                        SQLpool.query(`DROP TABLE table${idx};`, function (error, results, fields) {
                            sendMsg(res, `List \`${listname}\` sucessfully removed!`);
                        })
                    })
                }
            })
            return;
        }

        if (name === 'showlists'){
            SQLpool.query(`SELECT list_name AS name FROM table_list WHERE guild_id='${guild_id}';`, function (error, results, fields) {
                var msg = 'Here are all the lists created:';
                // console.log(results);
                for(const idx in results) msg = msg + (idx ? '\n- ' : '- ') + results[idx].name;
                sendMsg(res, msg);
            })
            return;
        }

        if (name === 'show' && data.options[0]){
            var listname = data.options[0].value;
            SQLpool.query(`SELECT id FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
                //console.log(results);
                if( results.length ){
                    SQLpool.query(`SELECT entry FROM table${results[0].id};`, function (error, results, fields) {
                        // console.log(results.length);
                        if(results.length){
                            var msg = `Here are all entries in list \`${listname}\``;
                            for(const idx in results) msg += (idx ? '\n- ' : '- ') + results[idx].entry;
                            sendMsg(res, msg);
                        }
                        else sendMsg(res, `No entry in list ${listname}!`);
                    })
                }
                else sendMsg(res, `List \`${listname}\` doesn't exist!`);
            })
            return;
        }

        if (name === 'remove' && data.options[0]){
            var listname = data.options[0].value;
            SQLpool.query(`DELETE FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
                if( results.length )
                    SQLpool.query(`DROP TABLE table${results[0].id}`, function (error, results, fields) {
                        sendMsg(res, `Successfully remove \`${listname}\`!`)
                    })
                else sendMsg(res, `List \`${listname}\` doesn't exist!`);
            })
            return;
        }

        if (name === 'draw' && data.options[0]){
            var listname = data.options[0].value;
            SQLpool.query(`SELECT * FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
                if( results.length )
                    SQLpool.query(`SELECT entry FROM table${results[0].id};`, function (error, results, fields) {
                        var idx = Math.floor(Math.random() * results.length);
                        sendMsg(res, `Lucky draw! You get \`${results[idx].entry}\` from list \`${listname}\`!`);
                    })
                else sendMsg(res, `List \`${listname}\` doesn't exist!`);
            })
            return;
        }

        if(name == 'add_to_list' && data.options[0].value && data.options[1].value){
            var entry = data.options[0].value;
            var listname = data.options[1].value;
            SQLpool.query(`SELECT id FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
                if( results.length ){
                    var idx = results[0].id;
                    SQLpool.query(`SELECT * FROM table${results[0].id} WHERE entry=('${entry}');`, function (error, results, fields) {
                        // console.log(results.length);
                        if(results.length) sendMsg(res, `Entry ${entry} exists in list \`${listname}\`!`)
                        else{
                            SQLpool.query(`INSERT INTO table${idx} (entry) VALUES ('${entry}');`, function (error, results, fields) {
                                sendMsg(res, `Successfully insert entry ${entry} into list \`${listname}\`!`)
                            })
                        }
                    })
                }
                else sendMsg(res, `List \`${listname}\` doesn't exist!`);
            })
            return;
        }

        if(name == 'remove_from_list' && data.options[0].value && data.options[1].value){
            var entry = data.options[0].value;
            var listname = data.options[1].value;
            SQLpool.query(`SELECT id FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
                if( results.length ){
                    var idx = results[0].id;
                    SQLpool.query(`SELECT * FROM table${results[0].id} WHERE entry=('${entry}');`, function (error, results, fields) {
                        //console.log(results);
                        if(results.length){
                            SQLpool.query(`DELETE FROM table${idx} WHERE entry=('${entry}');`, function (error, results, fields) {
                                sendMsg(res, `Successfully remove entry ${entry} from list \`${listname}\`!`)
                            })
                        }
                        else sendMsg(res, `Entry ${entry} doesn't exist in list \`${listname}\`!`)
                    })
                }
                else sendMsg(res, `List \`${listname}\` doesn't exist!`);
            })
            return;
        }

        console.error(`unknown command: ${name}`);
        return res.status(400).json({ error: 'unknown command' });
    }
    else {
        console.error('unknown interaction type', type);
        return res.status(400).json({ error: 'unknown interaction type' });
    }
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});
