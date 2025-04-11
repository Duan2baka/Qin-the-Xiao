const axios = require('axios');
const fs = require('fs');
const {AUTH_USERNAME, AUTH_PASSWORD, WEBUI_URL} = require('../key/sd_key');

module.exports = async function img(message){
    await message.channel.sendTyping();
    const payload = {
        prompt: message.content.substring(2),
        steps: 50, 
        width: 1024,
        height: 1024,
        sampler_index: 'DPM++ 2M SDE',
        override_settings: {
            sd_model_checkpoint: 'sdxlUnstableDiffusers_nihilmania.safetensors [a47e380db3]',
            save_to_dirs: false,
            sd_noise_schedule: 'Karras',
        }
    };
    try {
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
            await message.reply({ content: `Here is your generated image:`, files: [imageBuffer] });
            fs.unlinkSync(uniqueFilename);
        } else {
            await message.reply('Failed to generate image.');
        }
    } catch (error) {
        console.error('Error generating image:', error);
        await message.reply('An error occurred while generating the image.');
    }
}