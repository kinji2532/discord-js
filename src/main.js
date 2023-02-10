import { event, reconnect } from './init.js';
import {
  Interaction,
  getGuild, getChannel, getMessage, getReaction,
  sendMessage, addReaction, setTyping, deleteMessage,
  hasGuildMember, messageUrl, sleep, ReplyManager 
} from './functions.js';

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
  if(!list) return sendMessage("reply error", '1053457173314801686');
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
    addReaction(message.channel_id, result.id, 'delete', '721260517875777546');
  }
});

event.on('message_reaction_add', async react => {
  if(react.user_id === '506254167325671424') return;
  const message = await getMessage(react.channel_id, react.message_id);
  if(react.emoji.name !== 'delete'
  || message.author.id !== '395010195090178058') return;
  deleteMessage(message.channel_id, message.id);
});

event.on('application_command',
/** @param { Interaction } interaction */
async interaction => {
  const { data } = interaction;
  if(data.name === 'reply') {
    const json = await reply.load();
    const [ sub ] = data.options;
    const param = Object.fromEntries(sub.options.map(data => [data.name, data.value]));
    for(const i in json) {
      if(json[i].key === param.key) {
        if(sub.name === 'add') {
          json[i].value.push(param.value);
          if(param.weight) json[i].weight = param.weight*1;
          if(param.minWait || param.maxWait) json[i].wait = { min: param.minWait||param.maxWait, max: param.maxWait||param.minWait };
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
      await reply.save(json);
      return interaction.reply({ content: `${param.key}に${param.value}を登録しました` });
    } else {
      return interaction.reply({ content: `${param.key}は登録されていません` });
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

process.on('uncaughtException', error => {
  sendMessage(error.message, '1053457173314801686');
});