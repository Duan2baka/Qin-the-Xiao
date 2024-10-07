const { SlashCommandBuilder } = require('discord.js');
const { ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('export')
		.setDescription('Export the statistic of a user')
        .addUserOption((option) =>
            option
              .setName('user')
              .setDescription('user name')
              .setRequired(true),
          ),
	async execute(interaction, SQLpool) {
        // console.log(interaction.user.name)
        /*
        // console.log(interaction);
		let channel = interaction.channel;
        let guildId = channel.guildId;
        let id = interaction.id;
        let userId = interaction.user.id;
        let relative_path_wav = `../../tmp/export/${id}.json`;
        SQLpool.query(`SELECT * FROM voice_table WHERE guildId='${guildId}' AND userId='${userId}';`, function (error, results, fields) {
            if(results.length == 0){
                interaction.reply(`No data for user <${userId}>!`);
                return;
            }
            exp = JSON.stringify(results);
            fs.writeFileSync(path.resolve(__dirname, relative_path_wav), exp, function(err) {
                if (err) {
                    console.log(err);
                }
                fs.unlink(path.resolve(__dirname, relative_path_wav),(err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                        return;
                    }
                });
            });
            interaction.reply("Here is your statistic file:\n", { files: [relative_path_wav] });
        })*/
	},
};