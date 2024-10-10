const { SlashCommandBuilder } = require('discord.js');
const { ChannelType } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('statistic')
		.setDescription('Show the statistic of a user')
        .addUserOption((option) =>
            option
              .setName('user')
              .setDescription('user name')
              .setRequired(true),
          ),
	async execute(interaction, SQLpool) {
        let channel = interaction.channel;
        let guildId = channel.guildId;
        let user = interaction.options.getUser('user');
        let userId = user.id;
        SQLpool.query(`SELECT * FROM voice_table WHERE guildId='${guildId}' AND userId='${userId}';`, function (error, results, fields) {
            if(results.length == 0){
                interaction.reply(`No data for user ${user}!`);
                return;
            }
            var now = Date.now();
            var tot = 0;
            var tot10 = 0;
            for(var idx in results){
                var record = results[idx];
                var t = Number(record['timestamp']);
                if((now - t) / 1000 / 3600 / 24 <= 7) tot10 = tot10 + ((record['status'] == 1 && tot10 == 0) ? 0 : ((record['status'] == 0 ? -1 : 1) * t));
                tot = tot + (record['status'] == 0 ? -1 : 1) * t;
            }
            if(results[results.length - 1]['status'] == 0) tot = tot + now, tot10 = tot10 + now;
            var sec = Math.round(tot / 1000);
            var sec10 = Math.round(tot10 / 1000);
            var msg = `Total time in voice channel:\n**${Math.round(sec / 3600)}** hours, **${Math.round(sec / 60 % 60)}** minutes and **${Math.round(sec % 60)}** seconds!`;
            msg = msg + `\nTotal time in voice channel(previous 10 days):\n**${Math.round(sec10 / 3600)}** hours, **${Math.round(sec10 / 60 % 60)}** minutes and **${Math.round(sec10 % 60)}** seconds!`;
            interaction.reply(msg);
        });
	},
};