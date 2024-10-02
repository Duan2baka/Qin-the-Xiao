const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('remove a list')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('select your list')
                .setRequired(true)),
	async execute(interaction, SQLpool) {
		// console.log(interaction.options.getString('name'))
		guild_id = interaction.guildId
        var listname = interaction.options.getString('name');
        SQLpool.query(`SELECT * FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
            if( results.length ){
                var id=results[0].id;
                SQLpool.query(`DELETE FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
                    SQLpool.query(`DROP TABLE table${id}`, function (error, results, fields) {
                        interaction.reply(`Successfully remove \`${listname}\`!`)
                    })
                })
            }
            else interaction.reply(`List \`${listname}\` doesn't exist!`);
        })
	},
};