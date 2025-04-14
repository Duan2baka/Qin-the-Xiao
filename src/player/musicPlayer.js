const { EmbedBuilder } = require('discord.js');
const { useMainPlayer, useQueue } = require('discord-player');
const { SpotifyExtractor, DefaultExtractors } = require('@discord-player/extractor');

module.exports = async function main(message, client, player) {
    const args = message.content.split(' ');
    
    await player.extractors.loadMulti(DefaultExtractors);
    await player.extractors.register(SpotifyExtractor);
    

    if (args[0] === 's!play') {
        console.log('Command detected: s!play');

        if (args.length < 2) {
            return message.reply('Please provide a valid link or search keyword: `s!play <link or keyword>`');
        }

        const query = args.slice(1).join(' ');
        console.log('Search query:', query);

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('You need to join a voice channel first!');
        }
        
        try {
            const { track } = await player.play(message.member.voice.channel, query, {});

            return message.reply(`**${track.title}** enqueued!`);
        } catch (e) {
            // let's return error if something failed
            return message.reply(`Something went wrong: ${e}`);
        }
/*
        try {
            const loadingMsg = await message.channel.send('🔍 Searching for tracks...');

            const searchResult = await player.search(query, {
                requestedBy: message.author,

            });
            //console.log(searchResult.tracks[0]);

            if (!searchResult || !searchResult.tracks.length) {
                return loadingMsg.edit('❌ No results found!');
            }

            const queue = player.nodes.create(voiceChannel.guild.id, {
                metadata: {
                    channel: message.channel,
                    requestedBy: message.author,
                },
                leaveOnEmpty: true,
                leaveOnEnd: false,
            });

            if (!queue.connection) await queue.connect(voiceChannel);

            if (searchResult.playlist) {
                queue.addTrack(searchResult.playlist.tracks);
                await loadingMsg.edit(`✅ Added playlist to queue: **${searchResult.playlist.title}**`);
            } else {
                queue.addTrack(searchResult.tracks[0]);
                //player.play(message.channel, searchResult.tracks[0], {});
                await loadingMsg.edit(`✅ Added track to queue: **${searchResult.tracks[0].title}**`);
            }

            if (!queue.isPlaying()) await queue.node.play();
        } catch (error) {
            console.error('Search error:', error);
            message.reply('❌ Error searching for this query. Please check the link or keyword and try again!');
        }*/
    }
};