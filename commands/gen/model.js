const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const { AUTH_USERNAME, AUTH_PASSWORD, WEBUI_URL } = require('../../key/sd_key');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('models')
        .setDescription('List available models for Stable Diffusion'),

    async execute(interaction) {
        try {
            const response = await axios.get(`${WEBUI_URL}/sdapi/v1/sd-models`, {
                auth: {
                    username: AUTH_USERNAME,
                    password: AUTH_PASSWORD,
                },
            });
            if (response.status === 200) {
                const models = response.data;
                // console.log(models)
                if (models && models.length > 0) {
                    const modelList = models.map(model => model.title || JSON.stringify(model)).join('\n');
                    await interaction.reply(`Available models:\n\`\`\`\n${modelList}\n\`\`\``);
                } else {
                    await interaction.reply('No models available.');
                }
            } else {
                await interaction.reply('Failed to retrieve models.');
            }
        } catch (error) {
            console.error('Error retrieving models:', error);
            await interaction.reply('An error occurred while retrieving the models.');
        }
    },
};