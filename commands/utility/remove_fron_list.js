const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove_from_list')
		.setDescription('Remove an entry from a list')
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
                    //console.log(results);
                    if(results.length){
                        SQLpool.query(`DELETE FROM table${idx} WHERE entry=('${entry}');`, function (error, results, fields) {
                            interaction.reply(`Successfully remove entry ${entry} from list \`${listname}\`!`)
                        })
                    }
                    else interaction.reply(`Entry ${entry} doesn't exist in list \`${listname}\`!`)
                })
            }
            else interaction.reply(`List \`${listname}\` doesn't exist!`);
        })
	},
};