const EventEmitter = require('events');
const fetch = require('node-fetch');
const ws = require('ws');

const event = new EventEmitter();
const reconnect = {
  url: 'wss://gateway.discord.gg'
};

require('dotenv').config();
connect();


event.once('ready', async d => {
  console.log('connected.');
  await sendMessage("self connected.");
  reconnect.session_id = d.session_id;
  reconnect.url = d.resume_gateway_url;  
});

event.on('message_create', async message => {
  if(message.author.id === '506254167325671424') return;
  if(message.content.match(/(kinji|きんじ|キンジ|金次)/)
  || message.mentions.some(user => user.id === '395010195090178058')) {
    //console.log(message);
    const guild = await getGuild(message.guild_id);
    sendMessage({
      embeds: [{
        author: {
          name: message.author.username,
          icon_url: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
        },
        thumbnail: {
          url: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        },
        title: guild.name,
        url: messageUrl(message),
        description: message.content,
        image: message.attachments[0] ? {
          url: message.attachments[0].url
        }:undefined
      }]
    }, '1053136993841840238');
  }
});

async function sendMessage(content, id = '599272915153715201') {
  const data = typeof content === 'string' ? ({ content }):content;
  const result = await fetch(`https://discord.com/api/v10/channels/${id}/messages`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": 'Bot '+process.env.BOT_TOKEN
    },
    method: "POST",
    body: JSON.stringify(data)
  });
  return await result.json();
};

async function getGuild(id) {
  const result = await fetch(`https://discord.com/api/v10/guilds/${id}`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": process.env.SELF_TOKEN
    },
    method: "GET"
  });
  return await result.json();
};

function messageUrl(message) {
  return `https://discord.com/channels/${message.guild_id}/${message.channel_id}/${message.id}`;
}

function connect() {
  const connection = new ws(reconnect.url + '/?v=6&encoding=json');
  connection.onmessage = e => {
    const data = JSON.parse(e.data);

    if(data.op === 1) {
      sendMessage('op 1 request', '1053457173314801686');
      connection.send(`{ "op": 1, "d": ${reconnect.s||null} }`);
    }
    else if(data.op === 7) {
      sendMessage('op 7 request', '1053457173314801686');
      connection.send(JSON.stringify({
        "op": 6,
        "d": {
          "token": process.env.SELF_TOKEN,
          "session_id": reconnect.session_id,
          "seq": reconnect.s
        }
      }));
    }
    else if(data.op === 9) {
      sendMessage('op 9 request', '1053457173314801686');
      connection.close();
    }
    else if(data.op === 10) {
      const interval = data.d.heartbeat_interval;
      connection.send(JSON.stringify({
        "op": 2,
        "d": {
          "token": process.env.SELF_TOKEN,
          "capabilities": 125,
          "properties": {
            "os": "Windows", "browser": "Chrome", "device": "", "system_locale": "en-US",
            "browser_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36",
            "browser_version": "94.0.4606.61", "os_version": "10", "referrer": "", "referring_domain": "",
            "referrer_current": "", "referring_domain_current": "", "release_channel": "stable",
            "client_build_number": 99811, "client_event_source": null
          },
          "presence": { "status": "online", "since": 0, "activities": [], "afk": false },
          "compress": false,
          "client_state": { "guild_hashes": {}, "highest_last_message_id": "0", "read_state_version": 0, "user_guild_settings_version": -1 }
        }
      }));

      setInterval(() => {
        connection.send(`{ "op": 1, "d": ${reconnect.s||null} }`);
      }, interval);
      return;
    }
    else if(data.op !== 0 && data.op !== 11) sendMessage(data.op + ' request', '1053457173314801686');

    reconnect.s = data.s;

    if(!data.t || ![ 'READY', 'MESSAGE_CREATE'].includes(data.t)) return;

    event.emit(data.t?.toLowerCase(), data.d);

    //console.log(new Date(), data.t?.toLowerCase());
  };

  connection.onclose = () => {
    console.log('reconnected.');
    connect();
  };

  connection.onerror = error => {
    sendMessage('error', '1053457173314801686');
    console.log("エラー発生イベント受信", error.data);
  };
};