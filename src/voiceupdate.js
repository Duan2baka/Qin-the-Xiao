function voiceupdate(oldState, newState){
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
                var msg = `**User: **${user.username}\n**ID: **${user.id} ${user}\n`;
                // console.log(user);
                // console.log(log_channel);
                if (oldState.channelId === null){
                    client.channels.fetch(newState.channelId).then(channel=>{
                        msg = msg + `**Join to: **${channel}\n**At: **`;
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
                    })
                }
                else if (newState.channelId === null){
                    client.channels.fetch(oldState.channelId).then(channel=>{
                        msg = msg + `**Leave from: **${channel}\n**At: **`;
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
                                        .setTitle('[Leave Voice Channel]')
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
                    });
                }
                else return;
            });
        }
    });
}
module.exports = voiceupdate