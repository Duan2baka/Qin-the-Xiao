const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('draw')
		.setDescription('Randomly draw one entry from a list')
        .addStringOption(option =>
            option.setName('list')
                .setDescription('Select a list')
                .setRequired(true)),
	async execute(interaction, SQLpool) {
		// console.log(interaction.options.getString('name'))
		guild_id = interaction.guildId
        var listname = interaction.options.getString('list');
        SQLpool.query(`SELECT * FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
            if( results.length )
                SQLpool.query(`SELECT entry FROM table${results[0].id};`, function (error, results, fields) {
                    var idx = Math.floor(Math.random() * results.length);
                    interaction.reply(`Lucky draw! You get \`${results[idx].entry}\` from list \`${listname}\`!`);
                })
            else interaction.reply(`List \`${listname}\` doesn't exist!`);
        })
	},
};