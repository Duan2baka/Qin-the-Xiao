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
    //console.log(req);
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
        // "challenge" command
        if (name === 'challenge' && id) {
            // Interaction context
            const context = req.body.context;
            // User ID is in user field for (G)DMs, and member for servers
            const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
            // User's object choice
            const objectName = req.body.data.options[0].value;

            // Create active game using message ID as the game ID
            activeGames[id] = {
                id: userId,
                objectName,
            };
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    // Fetches a random emoji to send from a helper function
                    content: `Rock papers scissors challenge from <@${userId}>`,
                    components: [
                        {
                            type: MessageComponentTypes.ACTION_ROW,
                            components: [
                                {
                                    type: MessageComponentTypes.BUTTON,
                                    // Append the game ID to use later on
                                    custom_id: `accept_button_${req.body.id}`,
                                    label: 'Accept',
                                    style: ButtonStyleTypes.PRIMARY,
                                },
                            ],
                        },
                    ],
                },
            });
        }

        console.error(`unknown command: ${name}`);
        return res.status(400).json({ error: 'unknown command' });
    }

    /**
     * Handle requests from interactive components
     * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
     */
    if (type === InteractionType.MESSAGE_COMPONENT) {
        // custom_id set in payload when sending message component
        const componentId = data.custom_id;

        if (componentId.startsWith('accept_button_')) {
            // get the associated game ID
            const gameId = componentId.replace('accept_button_', '');
            // Delete message with token in request body
            const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
            try {
                await res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: 'What is your object of choice?',
                        // Indicates it'll be an ephemeral message
                        flags: InteractionResponseFlags.EPHEMERAL,
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.STRING_SELECT,
                                        // Append game ID
                                        custom_id: `select_choice_${gameId}`,
                                        options: getShuffledOptions(),
                                    },
                                ],
                            },
                        ],
                    },
                });
                // Delete previous message
                await DiscordRequest(endpoint, { method: 'DELETE' });
            } catch (err) {
                console.error('Error sending message:', err);
            }

        } else if (componentId.startsWith('select_choice_')) {
            // get the associated game ID
            const gameId = componentId.replace('select_choice_', '');

            if (activeGames[gameId]) {
                // Interaction context
                const context = req.body.context;
                // Get user ID and object choice for responding user
                // User ID is in user field for (G)DMs, and member for servers
                const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
                console.log(`<@${userId}>`);
                const objectName = data.values[0];
                // Calculate result from helper function
                const resultStr = getResult(activeGames[gameId], {
                    id: userId,
                    objectName,
                });

                // Remove game from storage
                delete activeGames[gameId];
                // Update message with token in request body
                const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

                try {
                    // Send results
                    await res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: resultStr },
                    });
                    // Update ephemeral message
                    await DiscordRequest(endpoint, {
                        method: 'PATCH',
                        body: {
                            content: 'Nice choice ' + getRandomEmoji(),
                            components: [],
                        },
                    });
                } catch (err) {
                    console.error('Error sending message:', err);
                }
            }
        }
    }
    else {
        console.error('unknown interaction type', type);
        return res.status(400).json({ error: 'unknown interaction type' });
    }
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});
