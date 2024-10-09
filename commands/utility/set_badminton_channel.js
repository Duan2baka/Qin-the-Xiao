const { SlashCommandBuilder } = require('discord.js');
const { ChannelType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set_badminton_channel')
		.setDescription('Set the output channel the badminton notification.')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('select a text channel')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        ),
	async execute(interaction, SQLpool) {
		channel = interaction.options.getChannel('channel');
        channelId = channel.id;
        guildId = channel.guildId;
        SQLpool.query(`SELECT * FROM badminton_table WHERE guildId='${guildId}';`, function (error, results, fields) {
            if(results.length)
                SQLpool.query(`UPDATE badminton_table SET channelId='${channelId}' WHERE guildId='${guildId}';`, function (error, results, fields) {
                    if(!error) interaction.reply('Update badminton channel successfully!');
                    else interaction.reply('Unknown error!');
                });
            else SQLpool.query(`INSERT INTO badminton_table (guildId, channelId) VALUES ('${guildId}', '${channelId}');`, function (error, results, fields) {
                if(!error) interaction.reply('Set badminton channel successfully!');
                else interaction.reply('Unknown error!');
            });
        })
	},
};