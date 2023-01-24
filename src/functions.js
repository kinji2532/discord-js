import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config();

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
    return await this.getReply();
  };
  async getReply() {
    const result = await fetch(`${url}/webhooks/${this.application_id}/${this.token}/messages/@original`, {
      headers,
      method: "GET"
    });
    return new Interaction(await result.json());
  };
  async editReply(data) {
    await fetch(`${url}/webhooks/${this.application_id}/${this.token}/messages/@original`, {
      headers,
      method: "PATCH",
      body: JSON.stringify(data)
    });
  };
  async deleteReply() {
    await fetch(`${url}/webhooks/${this.application_id}/${this.token}/messages/@original`, {
      headers,
      method: "DELETE"
    });
  };
  static async set(data, guild_id) {
    const result = await fetch(`${url}/applications/${process.env.APPLICATION_ID}/guilds/${guild_id}/commands`, {
      headers,
      method: "PUT",
      body: JSON.stringify(data)
    });
    if (result.ok) return true;
    else {
      const text = await result.text();
      return text;
    }
  };
};

export class ReplyManager {
  constructor(message,channel) {
    this.message_id = message;
    this.channel_id = channel;
  };
  async load() {
    try {
      const message = await getMessage(this.channel_id, this.message_id);
      const json = JSON.parse(message.content.replace(/^```json|```$/g, ''));
      return json;
    } catch(e) {
      console.log(e);
      return false;
    }
  };
  async save(json) {
    editMessage(`\`\`\`json\n${JSON.stringify(json)}\n\`\`\``, this.channel_id, this.message_id, 'SELF');
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

export async function editMessage(content, message_id, channel_id, type = 'BOT') {
  const data = typeof content === 'string' ? ({ content }):content;
  const result = await fetch(`${url}/channels/${channel_id}/messages/${message_id}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": type === 'BOT' ? 'Bot '+process.env.BOT_TOKEN : process.env.SELF_TOKEN
    },
    method: "PATCH",
    body: JSON.stringify(data)
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