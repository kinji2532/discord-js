const fetch = require('node-fetch');

require('dotenv').config();

sendMessage("( 'ω')");

async function sendMessage(content, id = '593069734656737313', type = 'BOT') {
  const data = typeof content === 'string' ? ({ content }):content;
  const result = await fetch(`https://discord.com/api/v10/channels/${id}/messages`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": type === 'BOT' ? 'Bot '+process.env.BOT_TOKEN : process.env.SELF_TOKEN
    },
    method: "POST",
    body: JSON.stringify(data)
  });
  return console.log(await result.json());
};