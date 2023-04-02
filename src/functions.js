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
  async send(data) {
    const result = await fetch(`${url}/interactions/${this.id}/${this.token}/callback`, {
      headers,
      method: "POST",
      body: JSON.stringify(data)
    });
    if (result.ok) return result.statusText;
    else {
      const text = await result.text();
      return text;
    }
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
  constructor(channel) {
    this.channel_id = channel;
  };
  async load() {
    try {
      const messages = await getMessages(this.channel_id);
      if(!messages.length) return { error: { message: 'late limited.', stack: '' } };
      const json = messages.reverse().map(message => Object.assign(JSON.parse(message.content?.replace(/^```json|```$/g, '')||'[]'), { id: message.id }));
      return json;
    } catch(e) {
      return { error: e };
    }
  };
  async save(json) {
    json.forEach(async data => {
      if(data.delete) return deleteMessage(this.channel_id, data.id);
      const message = await getMessage(this.channel_id, data.id);
      if(message.content === `\`\`\`json\n${JSON.stringify(data)}\n\`\`\``) return;
      else if(!data.id) {
        const result = await sendMessage(`\`\`\`json\n${JSON.stringify(data)}\n\`\`\``, this.channel_id, 'SELF');
        await addReaction(result.channel_id, result.id, 'open', '1079306756116709377');
        await sleep(1000);
        await addReaction(result.channel_id, result.id, 'close', '1079306788748402709');
      }
      else {
        const result = await editMessage(`\`\`\`json\n${JSON.stringify(data)}\n\`\`\``, data.id, this.channel_id, 'SELF');
        await addReaction(result.channel_id, result.id, 'open', '1079306756116709377');
        await sleep(1000);
        await addReaction(result.channel_id, result.id, 'close', '1079306788748402709');
      } 
    });
  };
};

/** @param { string } content @param { channel_id } id @param { send_type } type */
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
  const result = await fetch(`${url}/channels/${ch_id}/messages/${msg_id}`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": type === 'BOT' ? 'Bot '+process.env.BOT_TOKEN : process.env.SELF_TOKEN
    },
    method: "DELETE"
  });
  return { code: result.status, text: result.statusText };
};

export async function bulkDeleteMessage(ch_id, limit) {
  const messages = (await getMessages(ch_id, Math.min(limit, 100)))?.map(message => message.id);

  if(!messages) return;

  const result = await fetch(`${url}/channels/${ch_id}/messages/bulk-delete`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": 'Bot ' + process.env.BOT_TOKEN
    },
    body: JSON.stringify({ messages }),
    method: "POST"
  });
};

export async function deleteReaction(ch_id, msg_id, emoji_name, emoji_id, user_id, type = 'BOT') {
  const emoji = encodeURIComponent(`:${emoji_name}:${emoji_id}`);
  fetch(
    `${url}/channels/${ch_id}/messages/${msg_id}/reactions/${emoji}/${user_id}`, {
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

export async function getMessages(ch_id, limit) {
  const result = await fetch(`${url}/channels/${ch_id}/messages${limit ? '?limit=' + limit:''}`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": 'Bot ' + process.env.BOT_TOKEN
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

/** @param { string } content @param { message_id } message_id @param { channel_id } channel_id @param { send_type } type */
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