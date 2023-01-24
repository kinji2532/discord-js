import fetch from 'node-fetch';

const url = 'https://discord.com/api/v10';
const headers = { 
  "Content-Type": "application/json",
  "Authorization": 'Bot ' + process.env.BOT_TOKEN
};


export class Interaction {
  constructor(m) {
    for(const key in m) this[key] = m[key];
  };
  async reply(data) {
    await fetch(`${url}/interactions/${this.id}/${this.token}/callback`, {
      headers,
      method: "POST",
      body: JSON.stringify({ type: 4, data })
    });
  };
  async editReply(data) {
    await fetch(`${url}/webhooks/${this.application_id}/${this.token}/messages/@original`, {
      headers,
      method: "PATCH",
      body: JSON.stringify(data)
    });
  };
};


export async function sendMessage(content, id = '599272915153715201', type = 'BOT') {
  const data = typeof content === 'string' ? ({ content }):content;
  const result = await fetch(`${url}/channels/${id}/messages`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": type === 'BOT' ? 'Bot '+process.env.BOT_TOKEN : process.env.SELF_TOKEN
    },
    method: "POST",
    body: JSON.stringify(data)
  });
  return await result.json();
};

export async function deleteMessage(ch_id, msg_id, type = 'BOT') {
  fetch(`${url}/channels/${ch_id}/messages/${msg_id}`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": type === 'BOT' ? 'Bot '+process.env.BOT_TOKEN : process.env.SELF_TOKEN
    },
    method: "DELETE"
  });
};

export async function addReaction(ch_id, msg_id, emoji_name, emoji_id, type = 'BOT') {
  const emoji = encodeURIComponent(`:${emoji_name}:${emoji_id}`);
  fetch(
    `${url}/channels/${ch_id}/messages/${msg_id}/reactions/${emoji}/@me`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": type === 'BOT' ? 'Bot '+process.env.BOT_TOKEN : process.env.SELF_TOKEN
    },
    method: "PUT"
  });
};

export async function getGuild(id) {
  const result = await fetch(`${url}/guilds/${id}`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": process.env.SELF_TOKEN
    },
    method: "GET"
  });
  return await result.json();
};

export async function getChannel(id) {
  const result = await fetch(`${url}/channels/${id}`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": process.env.SELF_TOKEN
    },
    method: "GET"
  });
  return await result.json();
};

export async function getMessage(ch_id, msg_id) {
  const result = await fetch(`${url}/channels/${ch_id}/messages/${msg_id}`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": 'Bot ' + process.env.BOT_TOKEN
    },
    method: "GET"
  });
  return await result.json();
};

export async function getReaction(guild_id, emoji_id, type = 'BOT') {
  const result = await fetch(`${url}/guilds/${guild_id}/emojis/${emoji_id}`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": type === 'BOT' ? 'Bot '+process.env.BOT_TOKEN : process.env.SELF_TOKEN
    },
    method: "GET"
  });
  return await result.json();
};

export function messageUrl(message) {
  return `https://discord.com/channels/${message.guild_id}/${message.channel_id}/${message.id}`;
};

export async function hasGuildMember(guild_id, user_id) {
  const result = await fetch(`${url}/guilds/${guild_id}/members/${user_id}`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": process.env.SELF_TOKEN
    },
    method: "GET"
  });
  const data = await result.json();
  return !data.message;
};

export function setTyping(id, type = 'BOT') {
  fetch(`${url}/channels/${id}/typing`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": type === 'BOT' ? 'Bot '+process.env.BOT_TOKEN : process.env.SELF_TOKEN
    },
    method: "POST"
  });
};

export async function sleep(time) {
  return new Promise((res,rej) => setTimeout(() => res(true), time));
};