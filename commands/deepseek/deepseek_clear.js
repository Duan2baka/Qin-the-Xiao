const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deepseek_clear')
		.setDescription('Clear the history of current conversation'),
	async execute(interaction, SQLpool) {
		// console.log(interaction)
		const guildId = interaction.guildId ?? -1;
        const userId = interaction.user.id;
		SQLpool.query(`SELECT id,conversationId from deepseek WHERE guildId='${guildId}' AND userId='${userId}'`, function (error, results, fields) {
            if(results.length){
                var id = results[0].id;
                var conversationId = results[0].conversationId;
                SQLpool.query(`UPDATE deepseektable${id} SET content = '[]' WHERE id=${conversationId};`, function (error, results, fields) {
                    console.log(results.affectedRows )
                    interaction.reply({ content: results.affectedRows ? "Clear your conversation sucessfully!" : "Unkown error! Try to select a conversation first!",
                        ephemeral: true });
                });
            }
            else interaction.reply({ content: "Unkown error! Try to create a conversation first!",
                ephemeral: true });
        });
	},
};