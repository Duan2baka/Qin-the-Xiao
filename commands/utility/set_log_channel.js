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
		// console.log(interaction.options.getString('name'))
		channel = interaction.channel;
        channelId = channel.id;
        guildId = channel.guildId;
        /*SQL to add channel.id to channel.guildId*/
        /*
            SELECT * FROM tablename  WHERE guildId='${guildId}';
            if not null:
                UPDATE tablename SET channelId='${channelId}' WHERE guildId='${guildId}';
            else:
                INSERT INTO tablename (guildId, channelId) VALUES ('${guildId}', '${channelId}')
        
        */
	},
};