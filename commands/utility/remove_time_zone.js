const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove_time_zone')
		.setDescription('Add a time zone')
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Enter a number')
                .setRequired(true)
                .setMinValue(-12)
                .setMaxValue(12)),
	async execute(interaction, SQLpool) {
		// console.log(interaction.options.getString('name'))
		var guildId = interaction.guildId
        var timezone = interaction.options.getInteger('time');
        SQLpool.query(`SELECT id FROM timezone_table WHERE timezone=${timezone} AND guildId='${guildId}';`, function (error, results, fields) {
            if( !results.length ) interaction.reply(`Timezone GMT \`${timezone}\` doesn't exist!`);
            else
                SQLpool.query(`DELETE FROM timezone_table WHERE guildId='${guildId}' AND timezone=${timezone};`, function (error, results, fields) {
                    if(error) interaction.reply(`Unkonwn error when remove timezone!`);
                    else interaction.reply(`Successfully remove GMT ${timezone} from your server!`);
                });
        })
	},
};