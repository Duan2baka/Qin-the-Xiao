const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get_badminton')
		.setDescription('Get badminton status of PolyU in 7 days'),
	async execute(interaction) {
        interaction.reply({content: 'Wait for fetching data...', fetchReply: true}).then(message =>{ 
            // console.log(message.id)
            axios({
                method: 'post',
                url: 'http://127.0.0.1:9999/api',
                timeout: 60000
            })
            .then(response => {
                    let res = response.data;
                    if(Object.keys(res).length === 0){
                        message.edit('No available time slot yet!');
                    }
                    else{
                        var msg = `Here are totally ${Object.keys(res).length} available time slots:\n`;
                        for(var idx in res)
                            if(idx < 10)
                                msg = msg + `From **${res[idx]['start_time']}** to **${res[idx]['end_time']}**, at **${res[idx]['court']}**;\n`;
                        if(Object.keys(res).length > 10) msg = msg + '......'
                        message.edit(msg);
                    }
                })
            .catch(error => {
                console.error(error);
            });
        })
	},
};