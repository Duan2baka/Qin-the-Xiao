const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add_to_list')
		.setDescription('Add an entry to your list')
        .addStringOption(option =>
            option.setName('entry')
                .setDescription('Entry name')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('list')
                .setDescription('List name')
                .setRequired(true)),
	async execute(interaction, SQLpool) {
		// console.log(interaction.options.getString('name'))
		guild_id = interaction.guildId
        var entry = interaction.options.getString('entry');
        var listname = interaction.options.getString('list');
        SQLpool.query(`SELECT id FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
            if( results.length ){
                var idx = results[0].id;
                SQLpool.query(`SELECT * FROM table${results[0].id} WHERE entry=('${entry}');`, function (error, results, fields) {
                    // console.log(results.length);
                    if(results.length) interaction.reply(`Entry ${entry} exists in list \`${listname}\`!`)
                    else{
                        SQLpool.query(`INSERT INTO table${idx} (entry) VALUES ('${entry}');`, function (error, results, fields) {
                            interaction.reply(`Successfully insert entry ${entry} into list \`${listname}\`!`)
                        })
                    }
                })
            }
            else interaction.reply(`List \`${listname}\` doesn't exist!`);
        })
	},
};