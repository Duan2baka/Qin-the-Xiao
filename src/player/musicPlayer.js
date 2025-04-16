const { EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

async function playMusic(message, player, query) {
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
                bufferingTimeout: 15000,
                leaveOnStop: true,
                leaveOnStopCooldown: 600000,
                leaveOnEnd: true,
                leaveOnEndCooldown: 600000,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 600000,
                skipOnNoStream: true,
            });
        }
        if (!queue.connection) await queue.connect(voiceChannel);
        let searchResult;
        let trackLis;
        if (query.startsWith('http://') || query.startsWith('https://')) {
            if (query.includes('playlist?list')) {
                let tmpResult = await player.search(query, {
                    requestedBy: message.author,
                    searchEngine: 'youtubePlaylist',
                });
                if (!tmpResult) return message.reply('Wrong playlist URL!');
                trackLis = [];
                for (var idx in tmpResult.tracks) {
                    let tmp = await player.search(tmpResult.tracks[idx].url, {
                        requestedBy: message.author,
                        searchEngine: 'youtubeVideo',
                    });
                    trackLis.push(tmp);
                }
            } else searchResult = await player.search(query, {
                requestedBy: message.author,
                searchEngine: 'youtubeVideo',
            });
        } else {
            searchResult = await player.search(query, {
                requestedBy: message.author,
            });
        }
        if ((!searchResult || !searchResult.tracks.length) && trackLis && trackLis.length == 0)
            return message.reply('No results found. Please check your input!');
        if (trackLis)
            trackLis.forEach((element) => { queue.addTrack(element.tracks[0]); });
        else await queue.addTrack(searchResult.tracks[0]);
        message.reply(`Successfully added to the queue!`);
        if (!queue.isPlaying()) await queue.node.play();
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to play the music. Please try again later!');
    }
}

async function playNext(message, player, query) {
    if (!query) {
        return message.reply('Please provide a song name or YouTube URL!');
    }
    const queue = player.nodes.get(message.guild.id);
    if (!queue) {
        return message.reply('No queue found. Use `y!play` to start playing music first.');
    }
    try {
        let searchResult;
        if (query.startsWith('http://') || query.startsWith('https://')) {
            searchResult = await player.search(query, {
                requestedBy: message.author,
                searchEngine: 'youtubeVideo',
            });
        } else {
            searchResult = await player.search(query, {
                requestedBy: message.author,
            });
        }
        if (!searchResult || !searchResult.tracks.length) {
            return message.reply('No results found. Please check your input!');
        }
        queue.tracks.unshift(searchResult.tracks[0]); // Add to the beginning of the queue
        message.reply(`Successfully added **${searchResult.tracks[0].title}** as the next song!`);
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to add the song as the next track. Please try again later!');
    }
}

async function shufflePlay(message, player, query) {
    if (!query) {
        return message.reply('Please provide a playlist URL!');
    }
    const queue = player.nodes.get(message.guild.id);
    if (!queue) {
        return message.reply('No queue found. Use `y!play` to start playing music first.');
    }
    try {
        let playlistResult = await player.search(query, {
            requestedBy: message.author,
            searchEngine: 'youtubePlaylist',
        });
        if (!playlistResult || !playlistResult.tracks.length) {
            return message.reply('No playlist found. Please check your input!');
        }
        const shuffledTracks = playlistResult.tracks.sort(() => Math.random() - 0.5); // Shuffle the playlist
        shuffledTracks.forEach((track) => queue.addTrack(track));
        message.reply(`Successfully shuffled and added the playlist to the queue!`);
        if (!queue.isPlaying()) await queue.node.play();
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to shuffle the playlist. Please try again later!');
    }
}

async function wind(message, player, seconds) {
    try {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('There is no music currently playing!');
        }
        if (!seconds || isNaN(seconds)) {
            return message.reply('Please provide a valid number of seconds to wind forward!');
        }
        const newTime = queue.node.getTimestamp().current + seconds * 1000;
        await queue.node.seek(newTime);
        message.reply(`Wound forward by ${seconds} seconds!`);
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to wind forward. Please try again later!');
    }
}

async function rewind(message, player, seconds) {
    try {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('There is no music currently playing!');
        }
        if (!seconds || isNaN(seconds)) {
            return message.reply('Please provide a valid number of seconds to rewind!');
        }
        const newTime = Math.max(queue.node.getTimestamp().current - seconds * 1000, 0); // Ensure time doesn't go below 0
        await queue.node.seek(newTime);
        message.reply(`Rewound by ${seconds} seconds!`);
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to rewind. Please try again later!');
    }
}

async function seekToTime(message, player, time) {
    try {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('There is no music currently playing!');
        }
        const [minutes, seconds] = time.split(':').map(Number);
        if (isNaN(minutes) || isNaN(seconds)) {
            return message.reply('Please provide a valid time in the format MM:SS!');
        }
        const newTime = minutes * 60 * 1000 + seconds * 1000;
        await queue.node.seek(newTime);
        message.reply(`Seeked to ${time}!`);
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to seek to the specified time. Please try again later!');
    }
}

async function helpCommand(message) {
    const commands = {
        'y!play <query>': 'Play a song or add it to the queue. You can use a song name or a YouTube URL.',
        'y!playnext <query>': 'Add a song as the next track to play.',
        'y!shuffleplay <playlist URL>': 'Shuffle the playlist and add it to the queue.',
        'y!skip': 'Skip the currently playing song.',
        'y!pause': 'Pause the currently playing song.',
        'y!resume': 'Resume the paused song.',
        'y!shuffle': 'Shuffle the songs in the queue.',
        'y!queue': 'Display the current music queue.',
        'y!wind <seconds>': 'Wind forward the current track by a specified number of seconds.',
        'y!rewind <seconds>': 'Rewind the current track by a specified number of seconds.',
        'y!set <MM:SS>': 'Seek to a specific time in the current track.',
        'y!stop': 'Stop the music and clear the queue.',
        'y!help': 'Display this help message.',
    };

    const embed = new EmbedBuilder()
        .setTitle('🎵 Music Bot Commands')
        .setDescription('Here is a list of all available commands:')
        .setColor(0x00AE86);

    for (const [command, description] of Object.entries(commands)) {
        embed.addFields({ name: command, value: description, inline: false });
    }

    message.reply({ embeds: [embed] });
}

module.exports = async function main(message, player) {
    const args = message.content.split(' ');
    const command = args[0];
    const query = args.slice(1).join(' ');
    switch (command) {
        case 'y!play': playMusic(message, player, query); break;
        case 'y!playnext': playNext(message, player, query); break;
        case 'y!shuffleplay': shufflePlay(message, player, query); break;
        case 'y!skip': skipMusic(message, player); break;
        case 'y!shuffle': shuffleMusic(message, player); break;
        case 'y!pause': pauseMusic(message, player); break;
        case 'y!resume': resumeMusic(message, player); break;
        case 'y!queue': checkQueue(message, player); break;
        case 'y!wind': wind(message, player, parseInt(args[1], 10)); break;
        case 'y!rewind': rewind(message, player, parseInt(args[1], 10)); break;
        case 'y!set': seekToTime(message, player, args[1]); break;
        case 'y!stop': stopMusic(message, player); break;
        case 'y!help': helpCommand(message); break;
        default: message.reply('Unknown command!');
    }
};