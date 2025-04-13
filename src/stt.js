const https = require('https');
const axios = require('axios');
const fs = require('node:fs');
const path = require('node:path');
const ffmpeg = require('fluent-ffmpeg');
const FormData = require('form-data');
async function stt(item, message){
    var id = item.id
    var url = item.url;
    await message.channel.sendTyping();
    https.get(url, (res) => {
        const relative_path = `./tmp/audio/${id}.ogg`;
        const relative_path_wav = `./tmp/audio/${id}.wav`;
        const writeStream = fs.createWriteStream(relative_path);
        res.pipe(writeStream);
        writeStream.on("finish", () => {
            writeStream.close();

            ffmpeg(relative_path)
            .toFormat('wav')
            .on('error', (err) => {
                console.log('An error occurred: ' + err.message);
            })
            .on('end', () => {
                let target_url = "http://127.0.0.1:9977/api"

                var msg = 'The voice message has been converted to text:\n\n`';
                const formData = new FormData();
                formData.append('file', fs.createReadStream(relative_path_wav));
                formData.append('language', 'zh');
                formData.append('model', 'large-v2');
                formData.append('response_format', 'text');
                axios({
                    method: 'post',
                    url: target_url,
                    data: formData,
                    headers: {
                        ...formData.getHeaders(),
                    },
                    timeout: 60000
                })
                .then(response => {
                    msg += response.data['data'] + '\`'
                    const formData = new FormData();
                    formData.append('file', fs.createReadStream(relative_path_wav));
                    formData.append('language', 'zh');
                    formData.append('model', 'distil-large-v3');
                    formData.append('response_format', 'text');
                    axios({
                        method: 'post',
                        url: target_url,
                        data: formData,
                        headers: {
                            ...formData.getHeaders(),
                        },
                        timeout: 60000
                    }).then(response => {
                        message.reply(msg);
                        fs.unlink(path.resolve(relative_path),(err) => {
                            if (err) {
                                console.error('Error deleting file:', err);
                                return;
                            }
                        });
                        fs.unlink(path.resolve(relative_path_wav),(err) => {
                            if (err) {
                                console.error('Error deleting file:', err);
                                return;
                            }
                        });
                    })
                    .catch(error => {
                        console.error(error);
                    });
                })
                .catch(error => {
                    console.error(error);
                });
            })
            .save(relative_path_wav);
        })
    })

}
module.exports = stt