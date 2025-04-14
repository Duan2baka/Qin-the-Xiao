const { EmbedBuilder } = require('discord.js');
const { Player } = require('discord-player');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = async function main(message, client, player) {
    const args = message.content.split(' ').slice(1); 
    const query = args.join(' '); 

    if (!query) {
        return message.reply('Please provide a song name or YouTube URL!');
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
            selfDeaf: false, 
        });

        if (!connection) {
            return message.reply('Failed to join the voice channel. Please try again!');
        }

        var queue = player.nodes.get(message.guild.id);

        if (!queue) {
            queue = player.nodes.create(message.guild.id, {
                metadata: {
                    channel: message.channel,
                    voiceChannel: voiceChannel,
                },
            });
        }
        if (!queue.connection) await queue.connect(voiceChannel);


        let searchResult;
        if (query.startsWith('http://') || query.startsWith('https://')) {
            searchResult = await player.search(query, {
                requestedBy: message.author,
                searchEngine: 'youtube', 
            });
        } else {
            searchResult = await player.search(query, {
                requestedBy: message.author,
            });
        }

        if (!searchResult || !searchResult.tracks.length) {
            return message.reply('No results found. Please check your input!');
        }

        if (searchResult.playlist) {
            queue.addTrack(searchResult.tracks); 
            message.reply(`Added playlist \`${searchResult.playlist.title}\` to the queue!`);
        } else {
            const track = searchResult.tracks[0];
            queue.addTrack(track); 
            message.reply(`Added song \`${track.title}\` to the queue!`);
        }

        if (!queue.isPlaying()) {
            await queue.node.play();
        }
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to play the music. Please try again later!');
    }
};