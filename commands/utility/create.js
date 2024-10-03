const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.setDescription('Create a list')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name your list')
                .setRequired(true)),
	async execute(interaction, SQLpool) {
		// console.log(interaction.options.getString('name'))
		guild_id = interaction.guildId
        var listname = interaction.options.getString('name');
        SQLpool.query(`SELECT id FROM table_list WHERE list_name='${listname}' AND guild_id='${guild_id}';`, function (error, results, fields) {
            //console.log(results);
            if( results.length ) interaction.reply(`List \`${listname}\` exists!`);
            else{
                SQLpool.query(`INSERT INTO table_list (guild_id, list_name) VALUES ('${guild_id}', '${listname}');`, function (error, results, fields) {
                    // console.log(results.insertId);
                    SQLpool.query(`CREATE TABLE table${results.insertId} (id int NOT NULL AUTO_INCREMENT, entry varchar(16) NOT NULL, PRIMARY KEY (id));`, function (error, results, fields) {
                        interaction.reply(`List \`${listname}\` sucessfully created!`);
                    })
                })
            }
        })
	},
};