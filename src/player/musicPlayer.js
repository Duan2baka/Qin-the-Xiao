const { EmbedBuilder } = require('discord.js');
const { useMainPlayer, useQueue } = require('discord-player');
const ytdl = require('@distube/ytdl-core'); // For fetching YouTube audio streams
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
module.exports = async function main(message, client, player) {
    const args = message.content.split(' ');

    // Load and register extractors for Spotify and YouTube

    // Check for the s!play command
    if (args[0] === 'y!play') {

        const url = args[1];
        if (!ytdl.validateURL(url)) {
            return message.reply('Invalid URL. Please provide a valid YouTube URL.');
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('You need to be in a voice channel to play music!');
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 27, });

            const player = createAudioPlayer();
            const resource = createAudioResource(stream);
            player.play(resource);

            // Subscribe the connection to the player
            connection.subscribe(player);

            message.reply(`Now playing: ${url}`);
        } catch (error) {
            console.error(error);
            message.reply('An error occurred while trying to play the music.');
        }

        /*console.log('Command detected: s!play');

        // Ensure a link or keyword is provided
        if (args.length < 2) {
            return message.reply('Please provide a valid link or search keyword: `s!play <link or keyword>`');
        }

        const query = args.slice(1).join(' ');
        console.log('Search query:', query);

        // Check if the user is in a voice channel
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('You need to join a voice channel first!');
        }

        try {
            // Send a loading message
            const loadingMsg = await message.channel.send('🔍 Searching for tracks...');

            // Search for the query using discord-player
            const searchResult = await player.search(query, {
                requestedBy: message.author,
            });

            // Check if search results are found
            if (!searchResult || !searchResult.tracks.length) {
                return loadingMsg.edit('❌ No results found!');
            }

            // Create a queue for the guild
            const queue = player.nodes.create(voiceChannel.guild.id, {
                metadata: {
                    channel: message.channel,
                    requestedBy: message.author,
                },
                leaveOnEmpty: true, // Disconnect when the channel is empty
                leaveOnEnd: false,  // Stay connected after playback ends
            });

            if (!queue.connection) await queue.connect(voiceChannel);

            if (searchResult.playlist) {
                queue.addTrack(searchResult.playlist.tracks);
                await loadingMsg.edit(`✅ Added playlist to queue: **${searchResult.playlist.title}**`);
            } else {
                // Add single track to the queue
                console.log(searchResult.tracks[0])
                queue.addTrack('https://www.youtube.com/watch?v=ulOb9gIGGd0&ab_channel=westlifeVEVO');
                await loadingMsg.edit(`✅ Added track to queue: **${searchResult.tracks[0].title}**`);
            }

            // Play the queue if not already playing
            if (!queue.isPlaying()) await queue.node.play();
        } catch (error) {
            // Handle errors gracefully
            console.error('Search error:', error);
            message.reply('❌ Error searching for this query. Please check the link or keyword and try again!');
        }*/
    }
};

