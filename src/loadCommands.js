const fs = require('node:fs');
const path = require('node:path');
module.exports = async function main(client, foldersPath, moduleDir, modules) {
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    fs.readdirSync(moduleDir).forEach((file) => {
        const filePath = path.join(moduleDir, file);
    
        if (fs.statSync(filePath).isFile() && file.endsWith('.js')) {
            const moduleName = path.basename(file, '.js');
            modules[moduleName] = require(filePath);
        } else if (fs.statSync(filePath).isDirectory()) {
            fs.readdirSync(filePath).forEach((subFile) => {
                const subFilePath = path.join(filePath, subFile);
                if (fs.statSync(subFilePath).isFile() && subFile.endsWith('.js')) {
                    const subModuleName = path.basename(subFile, '.js');
                    modules[subModuleName] = require(subFilePath);
                }
            });
        }
    });
}