import { event, reconnect } from './init.js';
import {
  Interaction,
  getGuild, getChannel, getMessage, getReaction,
  sendMessage, addReaction, setTyping,
  deleteMessage, bulkDeleteMessage,
  hasGuildMember, messageUrl, sleep, ReplyManager 
} from './functions.js';
import { inspect } from 'util';
import { int } from 'prismarine-nbt';

const reply = new ReplyManager('1067259810287984750', '1052765687476666368');

event.once('ready', async d => {
  console.log('connected.');
  await sendMessage("self connected.");
  reconnect.session_id = d.session_id;
  reconnect.url = d.resume_gateway_url;  
});

event.on('message_create', async message => {
  if(message.author.id === '506254167325671424') return;
  const list = await reply.load();
  if(list.error) return sendMessage(`reply error: ${list.error.message}\n${list.error.stack}`, '1053457173314801686');
  const select = list.find(data => data.key === message.content);
  if(select) {
    if(Math.floor(Math.random() * (select.weight||0)) !== 0) return;
    sendMessage("call to send", '1053457173314801686');
    const type = hasGuildMember(message.guild_id, '506254167325671424') ? 'BOT' : 'SELF';
    if(type === 'SELF' && message.author.id === '395010195090178058') return;
    await sleep(Math.floor((Math.random() * select.wait?.min||0)+select.wait?.max||0) * 1000);
    setTyping(message.channel_id, type);
    await sleep(1000);
    const str = select.value[Math.floor(Math.random() * select.value.length)];
    sendMessage(str, message.channel_id, type);
  }
  else if(message.content.match(/(kinji|きんじ|キンジ|金次)/)
  || message.mentions.some(user => user.id === '395010195090178058')) {
    const channel = await getChannel(message.channel_id);

    if(channel.type === 1) return;
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
    addReaction(result.channel_id, result.id, 'delete', '721260517875777546');
  }
  if(message.author.id !== '395010195090178058') return;
  const [ cmd, ...args ] = message.content.split(' ');
  if(cmd === 'delete') {
    deleteMessage(message.channel_id, message.id, 'SELF');
    if(args[0] === 'count') bulkDeleteMessage(message.channel_id, args[1]);
    else args.forEach(msg_id => deleteMessage(message.channel_id, msg_id));
  }
  else if(cmd === 'send') {
    let result;
    deleteMessage(message.channel_id, message.id, 'SELF');
    try {
      result = await sendMessage(JSON.parse(args.join(' ')), message.channel_id);
    } catch(e) {
      result = await sendMessage(e.message, message.channel_id);
    }
    addReaction(message.channel_id, result.id, 'delete', '721260517875777546');
  }
});

event.on('message_reaction_add', async react => {
  if(react.user_id !== '395010195090178058') return;
  const message = await getMessage(react.channel_id, react.message_id);
  if(react.emoji.name !== 'delete') return;
  deleteMessage(message.channel_id, message.id);
});

event.on('application_command', async interaction => {
  const { data } = interaction;
  if(data.name === 'reply') {
    const json = await reply.load();
    const [ sub ] = data.options;
    if(sub.name === 'list') {
      const list = json.map(data => {
        return {
          "name": data.key,
          "value": `>>> ${data.value.join(', ')}\n確率: ${data.weight > 1 ? '1/'+data.weight:'確定'}\n待機: ${data.wait ? data.wait.min+'~'+data.wait.max+'秒':'無し'}`,
          "inline": true
        }
      }).slice(0, 25);
      return interaction.reply({ "embeds": [{
        "title": "reply list",
        "color": 255,
        "fields": list
      }]});
    }
    const param = Object.fromEntries(sub.options.map(data => [data.name, data.value]));
    for(const i in json) {
      if(json[i].key === param.key) {
        if(sub.name === 'add') {
          json[i].value.push(param.value);
          if(param.weight) json[i].weight = Math.max(param.weight, 1);
          if(param.min_wait || param.max_wait) json[i].wait = { min: Math.max(param.min_wait ?? 0, 0), max: Math.max(param.max_wait ?? param.min_wait, 0) };
          await reply.save(json);
          return interaction.reply({ content: `${param.key}に${param.value}を登録しました` });
        } else if(sub.name === 'remove') {
          if(!param.value) {
            json.splice(i,1);
            await reply.save(json);
            return interaction.reply({ content: param.key + 'で登録された文字を削除しました' });
          } else {
            const index = json[i].value.indexOf(param.value);
            if(index === -1) return interaction.reply({ content: `${param.key}に${param.value}は登録されていません` });
            json[i].value.splice(index,1);
            await reply.save(json);
            return interaction.reply({ content: `${param.key}の${param.value}を削除しました` });
          }
        } 
      }
    };
    if(sub.name === 'add') {
      json.push({"key": param.key, "value": [param.value]});
      if(param.weight) json.slice(-1)[0].weight = Math.max(param.weight, 1);
      if(param.min_wait || param.max_wait) json.slice(-1)[0].wait = { min: Math.max(param.min_wait ?? 0, 0), max: Math.max(param.max_wait ?? param.min_wait, 0) };
      await reply.save(json);
      return interaction.reply({ content: `${param.key}に${param.value}を登録しました` });
    } else {
      return interaction.reply({ content: `${param.key}は登録されていません` });
    }
  } 
  else if(data.name === 'eval') {
    const code = data.options[0].value;
    interaction.reply({ content: code });
    try {
      const result = eval(code);
      sendMessage(inspect(result).slice(0,2000), interaction.channel_id);
    } catch(e) {
      sendMessage(inspect(e).slice(0,2000), interaction.channel_id);
    }
  } else {
    console.log(interaction.data);
    interaction.reply({ content: 'ok' });
    await sleep(3000);
    interaction.editReply({ content: 'okk' });
    await sleep(3000);
    interaction.deleteReply();
  }
});

event.on('application_command_autocomplete', 
async interaction => {
  const { data } = interaction;
  if(data.name === 'reply') {
    const list = await reply.load();
    interaction.send({ type: 8, data: {
      choices: list.map(data => ({ name: data.key, value: data.key }))
    }});
  } else if(data.name === 'test') {
    interaction.send({ type: 8, data: {
      choices: interaction.data.options.map(data => ({ name: `${data.name}_${data.value}`, value: 'ok' }))
    }});
  }
});

process.on('uncaughtException', error => {
  sendMessage(error.message, '1053457173314801686');
});