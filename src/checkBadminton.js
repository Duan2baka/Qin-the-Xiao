const axios = require('axios');

function checkBadminton(client){
    axios({
        method: 'post',
        url: 'http://127.0.0.1:9999/api',
        timeout: 60000
    })
    .then(response => {
            let res = response.data;
            var msg = '';
            if(Object.keys(res).length === 0){
                msg = 'No available time slot yet!';
            }
            else{
                msg = `Here are totally ${Object.keys(res).length} available time slots:\n`;
                for(var idx in res)
                    if(idx < 10)
                        msg = msg + `From **${res[idx]['start_time']}** to **${res[idx]['end_time']}**, at **${res[idx]['court']}**;\n`;
                if(Object.keys(res).length > 10) msg = msg + '......';
            }
            SQLpool.query(`SELECT guildId, channelId FROM badminton_table;`, function (error, results, fields) {
                results.forEach(element =>{
                    // console.log(element['channelId'])
                    client.channels.cache.get(element['channelId']).send(msg);
                });
            })
        })
    .catch(error => {
        console.error(error);
    });
}