const { SlashCommandBuilder } = require('discord.js');
const { ChannelType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set_log_channel')
		.setDescription('Set the output channel of log.')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('select a text channel')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        ),
	async execute(interaction, SQLpool) {
		channel = interaction.channel;
        channelId = channel.id;
        guildId = channel.guildId;
        SQLpool.query(`SELECT * FROM channel_table WHERE guildId='${guildId}';`, function (error, results, fields) {
            if(results.length)
                SQLpool.query(`UPDATE channel_table SET channelId='${channelId}' WHERE guildId='${guildId}';`, function (error, results, fields) {
                    if(!error) interaction.reply('Update log channel successfully!');
                    else interaction.reply('Unknown error!');
                });
            else SQLpool.query(`INSERT INTO channel_table (guildId, channelId) VALUES ('${guildId}', '${channelId}');`, function (error, results, fields) {
                if(!error) interaction.reply('Set log channel successfully!');
                else interaction.reply('Unknown error!');
            });
        })
	},
};