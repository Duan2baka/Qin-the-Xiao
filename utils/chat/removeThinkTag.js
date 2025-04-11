var removeThinkTag = (x) => {
    try {
        let res = [];
        x.forEach(item => {
            let string = item['content'];
            while (true) {
                let startIndex = string.indexOf('<think>');
                let endIndex = string.indexOf('</think>');
                
                if (startIndex !== -1 && endIndex !== -1) {
                    string = string.substring(0, startIndex) + string.substring(endIndex + '</think>'.length + 2);
                } else {
                    break;
                }
            }
            item['content'] = string;
            res.push(item);
        });
        return res;
    } catch (error) {
        console.log('failed to remove think tag');
    }
}

module.exports = removeThinkTag;