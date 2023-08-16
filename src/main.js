import { event } from './init.js';
import { sendMessage, addReaction } from './functions.js';
import { inspect } from 'util';
import { Message } from './class.js';

const botId = '506254167325671424';
const cmdChId = '1052765687476666368'

event.once('ready', async () => {
  console.log('connected.');
  await sendMessage("self connected.");
});

event.on('message_create', /** @param { Message } message */ async message => {
  if(message.author.id === botId || message.channel.id === cmdChId) return;
  if(message.content.match(/(kinji|きんじ|キンジ|金次)/)
  || message.mentions?.some(user => user.id === '395010195090178058')) {

    if(message.channel.type === 1) return;
    console.log(message);

    const result = await sendMessage({
      embeds: [{
        author: { name: message.author.username, icon_url: message.author.avatar_url },
        thumbnail: { url: message.guild.icon_url },
        title: message.guild.name ? `[${message.guild.name}]<${message.channel.name}>` : 'DM',
        url: message.url,
        description: message.content,
        image: message.attachments ? { url: message.attachments[0].url } : undefined
      }]
    }, '593069734656737313');
    if(message.attachments?.length > 1) {
      sendMessage(message.attachments.map(attach => attach.url).join('\n'), '593069734656737313');
    }
    addReaction(result.channel_id, result.id, 'delete', '721260517875777546');
  }
});