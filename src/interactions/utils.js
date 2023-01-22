import fetch from "node-fetch";
import FormData from 'form-data';

import { inspect } from 'util';

const url = `https://discord.com/api/v10/applications/${process.env.APPLICATION_ID}/guilds/${process.env.GUILD_ID}/commands`;

const headers = { "Content-Type": "application/json","Authorization": `Bot ${process.env.BOT_TOKEN}` };

export async function set(data) {
  const result = await fetch(url, { headers, method: "PUT", body: JSON.stringify(data) });

  if (result.ok) return true;
  else {
    const text = await result.text();
    console.log(text);
    return false;
  }
};

export async function get(id) {
  const result = await fetch(url + (id ? `/${id}`:''), { headers, method: "GET" });

  const text = JSON.parse(await result.text());
  return text;
};

export async function add(data) {
  const result = await fetch(url, { headers, method: "POST", body: JSON.stringify(data) });

  if (result.ok) return true;
  else {
    const text = await result.text();
    console.log(text);
    return false;
  }
};

export async function _delete(id) {
  const result = await fetch(`${url}/${id}`, { headers, method: "DELETE" });
  const text = await result.text();

  return !text;
};

export async function save(data) {
  const form = new FormData();
  form.append('file', inspect([data]), 'cmdList.json');

  fetch('https://discord.com/api/v10/channels/1052765687476666368/messages',{
    headers: { "Authorization": `Bot ${process.env.BOT_TOKEN}` },
    method: "POST",
    body: form
  });
};

export async function load() {
  const data = await fetch(
    'https://discord.com/api/v10/channels/1052765687476666368/messages?limit=1',{
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bot ${process.env.BOT_TOKEN}`
    },
    method: "GET"
  });
  const message = JSON.parse(await data.text())[0];
  const result = await fetch(message.attachments[0].url, {method:'GET'});
  
  return eval(await result.text())[0];
};

export async function command() {
  return require('./commands');
};

export default { set, get, add, _delete, save, load, command }