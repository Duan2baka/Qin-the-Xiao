var deepReply = (message, responseData, EmbedBuilder, think) => {
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
        .setDescription(afterThink)
        .setTimestamp()
        .setFooter({ text: 'Deepseek-R1-14B'});
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
    .setDescription(afterThink)
    .setTimestamp()
    .setFooter({ text: 'Deepseek-R1-14B'});
    message.reply({embeds: [thinkMsg, embedMsg]});
}

module.exports = deepReply;