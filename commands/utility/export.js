const { SlashCommandBuilder } = require('discord.js');
const { ChannelType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('export')
		.setDescription('Export the statistic of a user')
        .addUserOption((option) =>
            option
              .setName('user')
              .setDescription('user name')
              .setRequired(true),
          ),
	async execute(interaction, SQLpool) {

	},
};