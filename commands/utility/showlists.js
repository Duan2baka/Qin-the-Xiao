const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('showlists')
		.setDescription('Show all lists created'),
	async execute(interaction, SQLpool) {
		// console.log(interaction)
		guild_id = interaction.guildId
		SQLpool.query(`SELECT list_name AS name FROM table_list WHERE guild_id='${guild_id}';`, function (error, results, fields) {
			var msg = 'Here are all the lists created:';
			// console.log(results);
			for(const idx in results) msg = msg + (idx ? '\n- ' : '- ') + results[idx].name;
			interaction.reply(msg);
		});
	},
};