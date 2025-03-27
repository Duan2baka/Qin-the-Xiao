const { EmbedBuilder } = require('discord.js');
var deepReply = (message , responseData, think) => {
    // console.log(responseData);
    let startIndex = responseData.indexOf('<think>');
    let endIndex = responseData.indexOf('</think>');

    let thinkText = responseData.substring(startIndex + '<think>'.length, endIndex);

    thinkText = thinkText.replace(/^\s*\n/gm, '');

    thinkText = thinkText.trim();

    let beforeThink = responseData.substring(0, startIndex);
    let afterThink = responseData.substring(endIndex + '</think>'.length);

    beforeThink = beforeThink.trim();
    afterThink = afterThink.trim();

    if(!thinkText.length || !think){
        const embedMsg = new EmbedBuilder()
        .setColor(0xFFD700)
        //.setDescription(afterThink)
        .setDescription(responseData)
        .setTimestamp()
        .setFooter({ text: 'Gemma3:27B'});
        message.reply({embeds: [embedMsg]});
        return;
    }
    const thinkMsg = new EmbedBuilder()
    .setColor(0x808080)
    .setDescription(thinkText)
    .setTimestamp()
    .setFooter({ text: 'Thinking process'});

    const embedMsg = new EmbedBuilder()
    .setColor(0xFFD700)
    //.setDescription(afterThink)
    .setDescription(responseData)
    .setTimestamp()
    .setFooter({ text: 'Gemma3:27B'});
    message.reply({embeds: [thinkMsg, embedMsg]});
}

var getReply = (responseData, think) => {
    // console.log(responseData);
    let startIndex = responseData.indexOf('<think>');
    let endIndex = responseData.indexOf('</think>');

    let thinkText = responseData.substring(startIndex + '<think>'.length, endIndex);

    thinkText = thinkText.replace(/^\s*\n/gm, '');

    thinkText = thinkText.trim();

    let beforeThink = responseData.substring(0, startIndex);
    let afterThink = responseData.substring(endIndex + '</think>'.length);

    beforeThink = beforeThink.trim();
    afterThink = afterThink.trim();

    if(!thinkText.length || !think){
        const embedMsg = new EmbedBuilder()
        .setColor(0xFFD700)
        //.setDescription(afterThink)
        .setDescription(responseData)
        .setTimestamp()
        .setFooter({ text: 'Gemma3:27B'});
        return {embeds: [embedMsg]};
        return;
    }
    const thinkMsg = new EmbedBuilder()
    .setColor(0x808080)
    .setDescription(thinkText)
    .setTimestamp()
    .setFooter({ text: 'Thinking process'});

    const embedMsg = new EmbedBuilder()
    .setColor(0xFFD700)
    //.setDescription(afterThink)
    .setDescription(responseData)
    .setTimestamp()
    .setFooter({ text: 'Gemma3:27B'});
    return {embeds: [thinkMsg, embedMsg]};
}

module.exports = {deepReply, getReply};