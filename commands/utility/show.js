const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('Show all entries in a list')
        .addStringOption(option =>
            option.setName('list')
                .setDescription('Select a list')
                .setRequired(true)),
	async execute(interaction, SQLpool) {
		// console.log(interaction.options.getString('name'))
		guild_id = interaction.guildId
        var listname = interaction.options.getString('list');
        SQLpool.query(`SELECT id FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
            //console.log(results);
            if( results.length ){
                SQLpool.query(`SELECT entry FROM table${results[0].id};`, function (error, results, fields) {
                    // console.log(results.length);
                    if(results.length){
                        var msg = `Here are all entries in list \`${listname}\``;
                        for(const idx in results) msg += (idx ? '\n- ' : '- ') + results[idx].entry;
                        interaction.reply(msg);
                    }
                    else interaction.reply(`No entry in list ${listname}!`);
                })
            }
            else interaction.reply(`List \`${listname}\` doesn't exist!`);
        })
	},
};