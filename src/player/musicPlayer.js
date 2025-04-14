const { EmbedBuilder } = require('discord.js');
const { Player } = require('discord-player');
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
                trackLis=[]
                for(var idx in tmpResult.tracks){
                    let tmp = await player.search(tmpResult.tracks[idx].url, {
                        requestedBy: message.author,
                        searchEngine: 'youtubeVideo', 
                    })
                    trackLis.push(tmp)
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
        //console.log(trackLis)
        if ((!searchResult || !searchResult.tracks.length) && trackLis.length == 0)
            return message.reply('No results found. Please check your input!');
        if (trackLis)
            trackLis.forEach( element => { queue.addTrack(element.tracks[0]); });
        else queue.addTrack(searchResult.tracks[0]); 

        if (!queue.isPlaying()) await queue.node.play();
    } catch (error) {
        console.error(error);
        message.reply('An error occurred while trying to play the music. Please try again later!');
    }
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
        default: message.reply('Unkown command!');
    }
};