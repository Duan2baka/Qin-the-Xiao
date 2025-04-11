const processString = (string) => {
    // Define the special symbols and their escaped counterparts
    const specialSymbols = {
        "'": "\\'",
        '"': '\\"',
        '\\': '\\\\'
    };
    let processedString = string.replace(/[\\'"]/g, match => specialSymbols[match]);
    return processedString;
};
module.exports = processString;