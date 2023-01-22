import { event, reconnect } from './init.js';
import {
  getGuild, getChannel, getMessage, getReaction,
  sendMessage, addReaction, setTyping, deleteMessage,
  hasGuildMember, messageUrl, sleep
} from './functions.js';

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
    addReaction(message.channel_id, result.id, 'delete', '721260517875777546');
  }
});

event.on('message_reaction_add', async react => {
  if(react.user_id === '506254167325671424') return;
  const message = await getMessage(react.channel_id, react.message_id);
  if(react.emoji.name !== 'delete'
  || message.author.id !== '506254167325671424') return;
  deleteMessage(message.channel_id, message.id);
});