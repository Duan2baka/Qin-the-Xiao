const { SpotifyExtractor, DefaultExtractors } = require('@discord-player/extractor');
const { Player } = require('discord-player');
const { EmbedBuilder } = require('discord.js');
const { YoutubeiExtractor } = require('discord-player-youtubei')

module.exports = async function playerBuilder(client) {
    const player = new Player(client);

    try {
        await player.extractors.loadMulti(DefaultExtractors);
        await player.extractors.register(SpotifyExtractor);
        await player.extractors.register(YoutubeiExtractor, {});
        //await player.extractors.loadDefault();
        console.log('YoutubeiExtractor registered successfully!');
    } catch (error) {
        console.error('Failed to register YoutubeiExtractor:', error);
    }
    //await player.extractors.loadMulti((ext) => ext === 'YouTubeExtractor' || ext === 'SpotifyExtractor' || ext === 'AttachmentExtractor');
    player.events.on('emptyQueue', (queue) => {
        if (queue.metadata && queue.metadata.channel) {
            queue.metadata.channel.send('⏹️ Queue is empty');
        }
    });

    player.events.on('error', (queue, error) => {
        console.error('Error when playing:', error);
        if (queue && queue.metadata && queue.metadata.channel) {
            queue.metadata.channel.send('❌ Error when playing');
        }
    });

    player.events.on('playerError', (queue, error) => {
        console.error(`[PlayerError] Error occurred in queue: ${queue.guild.name}`);
        console.error(error);
        if (queue.metadata && queue.metadata.channel) {
            queue.metadata.channel.send('❌ An error occurred while playing the track. Skipping...');
        }
    });

    player.events.on('audioTracksAdd', (queue, tracks) => {
        if (queue.metadata && queue.metadata.channel) {
            const embed = new EmbedBuilder()
                .setColor('#1DB954')
                .setTitle('📋 Added to queue')
                .setDescription(`**${tracks.length}** songs are added to queue`);

            queue.metadata.channel.send({ embeds: [embed] });
        }
    });

    player.events.on('playerStart', (queue, track) => {
        let nowPlaying=track;
        if(track.length > 1) nowPlaying=track[0];
        if (queue.metadata && queue.metadata.channel) {
            const embed = new EmbedBuilder()
                .setColor('#1DB954')
                .setTitle('🎵 Now playing')
                .setDescription(`**[${nowPlaying.title}](${nowPlaying.url})**`)
                .setThumbnail(nowPlaying.thumbnail)
                .addFields(
                    { name: '👤 Artist', value: nowPlaying.author, inline: true },
                    { name: '⏱️ Length', value: nowPlaying.duration, inline: true }
                );

            queue.metadata.channel.send({ embeds: [embed] });
        }
    });

    console.log('Player initialized successfully');
    return player;
};