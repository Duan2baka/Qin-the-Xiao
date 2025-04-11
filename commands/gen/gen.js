const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

const {AUTH_USERNAME, AUTH_PASSWORD, WEBUI_URL} = require('../../key/sd_key');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('gen')
        .setDescription('Generate an image from a prompt')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Enter a prompt for image generation')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('negative_prompt')
                .setDescription('Enter a negative_prompt for image generation')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('schedule')
                .setDescription('Choose a schedule type (e.g., Karras)')
                .setRequired(false)
                .addChoices(
                    { name: 'Karras', value: 'Karras' },
                    { name: 'Automatic', value: 'Automatic' },
                    { name: 'Uniform', value: 'Uniform' },
                    { name: 'DDIM', value: 'DDIM' },
                    { name: 'KL Optimal', value: 'KL Optimal' },
                    { name: 'Normal', value: 'Normal' },
                    { name: 'Simple', value: 'Simple' },
                    { name: 'Align Your Steps', value: 'Align Your Steps' },
                    // Add more schedule types if needed
                ))
        .addStringOption(option =>
            option.setName('sampling')
                .setDescription('Choose a sampling method (e.g., DPM++ 2M SDE)')
                .setRequired(false)
                .addChoices(
                    { name: 'DPM++ 2M SDE', value: 'DPM++ 2M SDE' },
                    { name: 'DPM++ 2M SDE Heun', value: 'DPM++ 2M SDE Heun' },
                    { name: 'DPM++ 2S a', value: 'DPM++ 2S a' },
                    { name: 'DPM++ 3M SDE', value: 'DPM++ 3M SDE' },
                    { name: 'Eular', value: 'Eular' },
                    { name: 'Eular a', value: 'Eular a' },
                    { name: 'DDIM', value: 'DDIM' },
                    { name: 'DDIM CFG++', value: 'DDIM CFG++' },
                    // Add more sampling methods if needed
                ))
        .addStringOption(option =>
            option.setName('model')
                .setDescription('Choose a model')
                .setRequired(false)
                .addChoices(
                    { name: 'sdxlUnstableDiffusers_nihilmania.safetensors [a47e380db3]', value: 'sdxlUnstableDiffusers_nihilmania.safetensors [a47e380db3]' },
                    { name: 'harukiMIX_ponyV30.safetensors [e67bea63d3]', value: 'harukiMIX_ponyV30.safetensors [e67bea63d3]' },
                    { name: 'peoplemasterPro_noobV2VAE.safetensors [2a7fe5fdb2]', value: 'peoplemasterPro_noobV2VAE.safetensors [2a7fe5fdb2]' },
                    { name: 'sd_xl_base_0.9.safetensors [1f69731261]', value: 'sd_xl_base_0.9.safetensors [1f69731261]' },
                    { name: 'sdxlUnstableDiffusers_nihilmania.safetensors [a47e380db3]', value: 'sdxlUnstableDiffusers_nihilmania.safetensors [a47e380db3]' },
                    { name: 'uiIcons_v10.safetensors [853c958d90]', value: 'uiIcons_v10.safetensors [853c958d90]' },
                    { name: 'ultrarealFineTune_v4.safetensors [f3cd5eb8ac]', value: 'ultrarealFineTune_v4.safetensors [f3cd5eb8ac]' },
                    { name: 'v1-5-pruned-emaonly.safetensors [6ce0161689]', value: 'v1-5-pruned-emaonly.safetensors [6ce0161689]' },
                    { name: 'waiNSFWIllustrious_v110.safetensors', value: 'waiNSFWIllustrious_v110.safetensors' }
                ))
        .addIntegerOption(option =>
            option.setName('width')
                .setDescription('Width of the generated image')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('height')
                .setDescription('Height of the generated image')
                .setRequired(false)),
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const negative_prompt = interaction.options.getString('negative_prompt') || '';
        const schedule = interaction.options.getString('schedule') || 'Karras'; // Default to 'Karras'
        const sampling = interaction.options.getString('sampling') || 'DPM++ 2M SDE'; // Default to 'DPM++ 2M SDE'
        const width = interaction.options.getInteger('width') || 512;
        const height = interaction.options.getInteger('height') || 512;
        const sd_model_checkpoint = interaction.options.getString('model') || 'sdxlUnstableDiffusers_nihilmania.safetensors [a47e380db3]';

        const payload = {
            prompt: prompt,
            negative_prompt: negative_prompt,
            steps: 50, 
            width: width,
            height: height,
            sampler_index: sampling,
            override_settings: {
                sd_model_checkpoint: sd_model_checkpoint,
                save_to_dirs: false,
                sd_noise_schedule: schedule,
            }
        };

        try {
            await interaction.reply('Generating image, please wait...');

            const response = await axios.post(`${WEBUI_URL}/sdapi/v1/txt2img`, payload, {
                auth: {
                    username: AUTH_USERNAME,
                    password: AUTH_PASSWORD
                }
            });
            const r = response.data;

            if (r.images && r.images.length > 0) {
                const outputDir = './output';
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir);
                }
                const timestamp = Date.now();
                const uniqueFilename = `${outputDir}/output_${timestamp}.png`;
                const imageBuffer = Buffer.from(r.images[0], 'base64');
                fs.writeFileSync(uniqueFilename, imageBuffer);
                await interaction.editReply({ content: `Here is your generated image:`, files: [imageBuffer] });
                fs.unlinkSync(uniqueFilename);
            } else {
                await interaction.editReply('Failed to generate image.');
            }
        } catch (error) {
            console.error('Error generating image:', error);
            await interaction.editReply('An error occurred while generating the image.');
        }
    },
};