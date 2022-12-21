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
    const result = await sendMessage({
      embeds: [{
        author: {
          name: message.author.username,
          icon_url: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
        },
        thumbnail: {
          url: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        },
        title: guild.name || 'DM',
        url: messageUrl(message),
        description: message.content,
        image: message.attachments[0] ? {
          url: message.attachments[0].url
        }:undefined
      }]
    }, '593069734656737313');
    sendReaction(result.channel_id, result.id, 'delete', '721260517875777546');
  }
  else if(message.content === "( 'ω')" && ![ '506254167325671424' ].includes(message.author.id)) {
    if(Math.floor(Math.random() * 3) !== 0) return;
    sendMessage("call to ( 'ω')", '1053457173314801686');
    const type = hasGuildMember(message.guild_id, '506254167325671424') ? 'BOT' : 'SELF';
    if(type === 'SELF' && message.author.id === '395010195090178058') return;
    await sleep(Math.floor((Math.random() * 3) + 1) * 1000);
    setTyping(message.channel_id, type);
    await sleep(1000);
    sendMessage("( 'ω')", message.channel_id, type);
  }
  if(message.author.id !== '395010195090178058') return;
  const [ cmd, ...args ] = message.content.split(' ');
  if(cmd === 'delete') {
    deleteMessage(message.channel_id, message.id, 'SELF');
    args.forEach(msg_id => deleteMessage(message.channel_id, msg_id));
  }
  else if(cmd === 'send') {
    let result;
    deleteMessage(message.channel_id, message.id, 'SELF');
    try {
      result = await sendMessage(JSON.parse(args.join(' ')), message.channel_id);
    } catch(e) {
      result = await sendMessage(e.message, message.channel_id);
    }
    sendReaction(message.channel_id, result.id, 'delete', '721260517875777546');
  }
});

event.on('message_reaction_add', async react => {
  if(react.user_id === '506254167325671424') return;
  const message = await getMessage(react.channel_id, react.message_id);
  if(react.emoji.name !== 'delete'
  || message.author.id !== '506254167325671424') return;
  deleteMessage(message.channel_id, message.id);
});

async function sendMessage(content, id = '599272915153715201', type = 'BOT') {
  const data = typeof content === 'string' ? ({ content }):content;
  const result = await fetch(`https://discord.com/api/v10/channels/${id}/messages`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": type === 'BOT' ? 'Bot '+process.env.BOT_TOKEN : process.env.SELF_TOKEN
    },
    method: "POST",
    body: JSON.stringify(data)
  });
  return await result.json();
};

async function deleteMessage(ch_id, msg_id, type = 'BOT') {
  fetch(`https://discord.com/api/v10/channels/${ch_id}/messages/${msg_id}`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": type === 'BOT' ? 'Bot '+process.env.BOT_TOKEN : process.env.SELF_TOKEN
    },
    method: "DELETE"
  });
};

async function sendReaction(ch_id, msg_id, emoji_name, emoji_id, type = 'BOT') {
  const emoji = encodeURIComponent(`:${emoji_name}:${emoji_id}`);
  fetch(
    `https://discord.com/api/v10/channels/${ch_id}/messages/${msg_id}/reactions/${emoji}/@me`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": type === 'BOT' ? 'Bot '+process.env.BOT_TOKEN : process.env.SELF_TOKEN
    },
    method: "PUT"
  });
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

async function getMessage(ch_id, msg_id) {
  const result = await fetch(`https://discord.com/api/v10/channels/${ch_id}/messages/${msg_id}`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": 'Bot ' + process.env.BOT_TOKEN
    },
    method: "GET"
  });
  return await result.json();
};

async function getReaction(guild_id, emoji_id, type = 'BOT') {
  const result = await fetch(`https://discord.com/api/v10/guilds/${guild_id}/emojis/${emoji_id}`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": type === 'BOT' ? 'Bot '+process.env.BOT_TOKEN : process.env.SELF_TOKEN
    },
    method: "GET"
  });
  return await result.json();
};

function messageUrl(message) {
  return `https://discord.com/channels/${message.guild_id}/${message.channel_id}/${message.id}`;
};

async function hasGuildMember(guild_id, user_id) {
  const result = await fetch(`https://discord.com/api/v10/guilds/${guild_id}/members/${user_id}`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": process.env.SELF_TOKEN
    },
    method: "GET"
  });
  const data = await result.json();
  return !data.message;
};

function setTyping(id, type = 'BOT') {
  fetch(`https://discord.com/api/v10/channels/${id}/typing`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": type === 'BOT' ? 'Bot '+process.env.BOT_TOKEN : process.env.SELF_TOKEN
    },
    method: "POST"
  });
};

async function sleep(time) {
  return new Promise((res,rej) => setTimeout(() => res(true), time));
};

function connect() {
  const connection = new ws(reconnect.url + '/?v=6&encoding=json');
  connection.onmessage = e => {
    const data = JSON.parse(e.data);

    if(data.op === 1) {
      sendMessage('op 1 request', '1053457173314801686');
      connection.send(`{ "op": 1, "d": ${reconnect.s||null} }`);
    }
    else if(data.op === 7) {
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
      sendMessage('op 10 request', '1053457173314801686');
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
    else if(data.op !== 0 && data.op !== 11) sendMessage('op ' +data.op + ' request', '1053457173314801686');

    reconnect.s = data.s;

    if(!data.t || ![ 'READY', 'MESSAGE_CREATE', 'MESSAGE_REACTION_ADD' ].includes(data.t)) return;

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