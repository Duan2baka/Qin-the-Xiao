const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add_time_zone')
		.setDescription('Add a time zone')
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Enter a number')
                .setRequired(true)
                .setMinValue(-12)
                .setMaxValue(12)),
	async execute(interaction, SQLpool) {
		// console.log(interaction.options.getString('name'))
		guild_id = interaction.guildId
        var timezone = interaction.options.getInteger('time');
        SQLpool.query(`SELECT id FROM timezone_table WHERE timezone=${timezone} AND guildId='${guild_id}';`, function (error, results, fields) {
            if( results.length ) interaction.reply(`Timezone \`${timezone}\` exists!`);
            else
                SQLpool.query(`INSERT INTO timezone_table (guildId, timezone) VALUES ('${guild_id}', ${timezone});`, function (error, results, fields) {
                    if(error) interaction.reply(`Unkonwn error when set timezone!`);
                    else interaction.reply(`Successfully add GMT ${timezone} into your server!`);
                });
        })
	},
};