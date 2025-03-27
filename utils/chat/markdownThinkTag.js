var markdownThinkTag = (string) => {
    try {
        let startIndex = string.indexOf('<think>');
        let endIndex = string.indexOf('</think>');

        if (startIndex !== -1 && endIndex !== -1) {
            let thinkText = string.substring(startIndex + '<think>'.length, endIndex);
            let lines = thinkText.split('\n');
            let modifiedLines = lines.map(line => `> ${line}`);
            let modifiedThinkText = modifiedLines.join('\n');
            return string.substring(0, startIndex) + modifiedThinkText + '\n' + string.substring(endIndex + '</think>'.length + 2);
        }
        return;
    } catch (error) {
        console.log('failed to change the thinking format');
    }
}

module.exports = markdownThinkTag;