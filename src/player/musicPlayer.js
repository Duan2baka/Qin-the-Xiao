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
            if(query.includes('playlist?list')){
                let tmpResult = await player.search(query, {
                    requestedBy: message.author,
                    searchEngine: 'youtubePlaylist', 
                });
                if(!tmpResult) return message.reply('Wrong playlist URL!');
                trackLis=[];
                for(var idx in tmpResult.tracks){
                    let tmp = await player.search(tmpResult.tracks[idx].url, {
                        requestedBy: message.author,
                        searchEngine: 'youtubeVideo', 
                    });
                    trackLis.push(tmp);
                }
            }
            else searchResult = await player.search(query, {
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
            trackLis.forEach( element => { queue.addTrack(element.tracks[0]); });
        else await queue.addTrack(searchResult.tracks[0]); 
        message.reply(`Sucessfully added to the queue!`);
        if (!queue.isPlaying()) await queue.node.play();
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to play the music. Please try again later!');
    }
}

async function skipMusic(message, player) {
    try {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('There is no music currently playing!');
        }
        const currentTrack = queue.currentTrack;
        queue.node.skip();
        message.reply(`Skipped the track: **${currentTrack.title}**`);
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to skip the track. Please try again later!');
    }
}

async function shuffleMusic(message, player) {
    try {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('There is no music currently playing!');
        }
        queue.tracks.shuffle();
        message.reply('The queue has been shuffled!');
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to shuffle the queue. Please try again later!');
    }
}

async function pauseMusic(message, player) {
    try {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('There is no music currently playing!');
        }
        if (queue.node.isPaused()) {
            return message.reply('The music is already paused!');
        }
        queue.node.pause();
        message.reply('The music has been paused!');
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to pause the music. Please try again later!');
    }
}

async function resumeMusic(message, player) {
    try {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('There is no music currently playing!');
        }
        if (!queue.node.isPaused()) {
            return message.reply('The music is already playing!');
        }
        queue.node.resume();
        message.reply('The music has been resumed!');
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to resume the music. Please try again later!');
    }
}
async function checkQueue(message, player) {
    try {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.tracks.size) {
            return message.reply('The queue is currently empty!');
        }

        const currentTrack = queue.currentTrack;
        const tracks = queue.tracks.toArray();
        const queueList = tracks
            .slice(0, 10) 
            .map((track, index) => `${index + 1}. **${track.title}** (${track.duration})`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setTitle('🎵 Current Queue')
            .addFields(
                { name: 'Now Playing', value: `**${currentTrack.title}** (${currentTrack.duration})`, inline: false },
                { name: 'Up Next', value: queueList || 'No more songs in the queue!', inline: false }
            )
            .setColor(0x00AE86)
            .setFooter({ text: `Total songs in queue: ${queue.tracks.size}` });

        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to check the queue. Please try again later!');
    }
}

async function stopMusic(message, player) {
    try {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('There is no music currently playing!');
        }
        queue.delete(); 
        message.reply('Music playback has been stopped and the queue has been cleared!');
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to stop the music. Please try again later!');
    }
}

async function helpCommand(message) {
    const commands = {
        'y!play <query>': 'Play a song or add it to the queue. You can use a song name or a YouTube URL.',
        'y!skip': 'Skip the currently playing song.',
        'y!pause': 'Pause the currently playing song.',
        'y!resume': 'Resume the paused song.',
        'y!shuffle': 'Shuffle the songs in the queue.',
        'y!queue': 'Display the current music queue.',
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
    const query = args.slice(1).join(' '); 
    switch(args[0]){
        case 'y!play': playMusic(message, player, query); break;
        case 'y!skip': skipMusic(message, player); break;
        case 'y!shuffle': shuffleMusic(message, player); break;
        case 'y!pause': pauseMusic(message, player); break;
        case 'y!resume': resumeMusic(message, player); break;
        case 'y!queue': checkQueue(message, player); break;
        case 'y!stop': stopMusic(message, player); break;
        case 'y!help': helpCommand(message); break;
        default: message.reply('Unkown command!');
    }
};