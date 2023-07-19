import { event, reconnect } from './init.js';
import {
  Interaction,
  getGuild, getChannel, getMessage, getReaction,
  sendMessage, addReaction, setTyping,
  deleteMessage, bulkDeleteMessage, deleteReaction,
  hasGuildMember, messageUrl, sleep, ReplyManager, editMessage
} from './functions.js';
import { inspect } from 'util';
const reply = new ReplyManager('1052765687476666368');

event.once('ready', async d => {
  console.log('connected.');
  await sendMessage("self connected.");
  reconnect.session_id = d.session_id;
  reconnect.url = d.resume_gateway_url;  
});

event.on('message_create', async message => {
  if(message.author.id === '506254167325671424'
  || message.channel_id === '1052765687476666368') return;
  if([ '919862408837730345' ].includes(message.guild_id)) {
    const list = await reply.load();
    if(list.error) {
      const result = await sendMessage(`reply error: ${list.error.message}\n${list.error.stack}`, '1092066196288970774');
      addReaction(result.channel_id, result.id, 'delete', '721260517875777546');
      return;
    }
    const select = list.find(data => message.content.includes(data.key));
    if(select) {
      if(!select.include && message.content !== select.key) return;
      let num = Math.floor(Math.random() * select.values.reduce((a, b) => a + (b.weight ?? 1), 0)) + 1;
      const choice = select.values.find(data => (num -= (data.weight ?? 1)) < 1);
      if(Math.floor(Math.random() * (choice.chance ?? 0)) !== 0) return;
      sendMessage("call to send", '1053457173314801686');
      const type = hasGuildMember(message.guild_id, '506254167325671424') ? 'BOT' : 'SELF';
      if(type === 'SELF' && message.author.id === '395010195090178058') return;
      await sleep(Math.floor((Math.random() * (choice.wait?.max||0 - choice.wait?.min||0))+choice.wait?.min||0) * 1000);
      setTyping(message.channel_id, type);
      await sleep(1000);
      const str = choice.value[Math.floor(Math.random() * choice.value.length)];
      sendMessage(str, message.channel_id, type);
    }
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
        title: guild.name ? `[${guild.name}]<${channel.name}>`:'DM',
        url: messageUrl(message),
        description: message.content,
        image: message.attachments.length === 1 ? {
          url: message.attachments[0].url
        }:undefined
      }]
    }, '593069734656737313');
    if(message.attachments.length > 1) {
      sendMessage(message.attachments.map(attach => attach.url).join('\n'));
    }
    addReaction(result.channel_id, result.id, 'delete', '721260517875777546');
  }
  if(message.author.id !== '395010195090178058') return;
  const [ cmd, ...args ] = message.content.split(' ');
  if(cmd === 'delete') {
    deleteMessage(message.channel_id, message.id, 'SELF');
    if([ 'count', 'c' ].includes(args[0])) bulkDeleteMessage(message.channel_id, args[1]);
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
  if(react.emoji.name === 'delete') {
    deleteMessage(message.channel_id, message.id);
  } else if(react.emoji.name === 'open') {
    editMessage(`\`\`\`json\n${JSON.stringify(JSON.parse(message.content?.replace(/^```json|```$/g, '')||'[]'), null, 2)}\n\`\`\``, message.id, message.channel_id, 'SELF');
    deleteReaction(message.channel_id, message.id, 'open', '1079306756116709377', react.user_id);
  }else if(react.emoji.name === 'close') {
    editMessage(`\`\`\`json\n${JSON.stringify(JSON.parse(message.content?.replace(/^```json|```$/g, '')||'[]'))}\n\`\`\``, message.id, message.channel_id, 'SELF');
    deleteReaction(message.channel_id, message.id, 'close', '1079306788748402709', react.user_id);
  }
});

event.on('application_command', async interaction => {
  const { data } = interaction;
  if(data.name === 'reply') {
    const json = await reply.load();
    if(json.error) return sendMessage(`reply error: ${list.error.message}\n${list.error.stack}`, '1053457173314801686');
    const [ sub ] = data.options;
    if(sub.name === 'list') {
      const list = json.map(data => {
        return {
          "name": data.key,
          "value": '>>> ' + data.values.map(choice => `${choice.value.join(', ')}\n抽選率: ${choice.weight ?? 1}\n確率: ${choice.chance > 1 ? '1/'+choice.chance:'確定'}\n待機: ${choice.wait ? choice.wait.min+'~'+choice.wait.max+'秒':'無し'}`).join('\n'),
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
          const num = json[i].values.push({ value: [ param.value ] }) - 1;
          if(param.weight) json[i].values[num].weight = Math.max(param.weight, 1);
          if(param.chance) json[i].values[num].chance = Math.max(param.chance, 1);
          if(param.include !== undefined) json[num].include = param.include;
          if(param.min_wait || param.max_wait) json[i].values[num].wait = { min: Math.max(param.min_wait ?? 0, 0), max: Math.max(param.max_wait ?? param.min_wait, 0) };
          await reply.save(json);
          return interaction.reply({ content: `${param.key}に${param.value}を登録しました` });
        } else if(sub.name === 'remove') {
          if(!param.value) {
            json[i].delete = true;
            await reply.save(json);
            return interaction.reply({ content: param.key + 'で登録された文字を削除しました' });
          } else {
            const choice = json[i].values.findIndex(choice => choice.value.includes(param.value));
            if(!choice) return interaction.reply({ content: `${param.key}に${param.value}は登録されていません` });
            const index = json[i].values[choice].value.indexOf(param.value);
            if(index === -1) return interaction.reply({ content: `${param.key}に${param.value}は登録されていません` });
            if(json[i].values[choice].value.length === 1) json[i].values.splice(choice, 1);
            else json[i].values[choice].value.splice(index, 1);
            await reply.save(json);
            return interaction.reply({ content: `${param.key}の${param.value}を削除しました` });
          }
        } 
      }
    };
    if(sub.name === 'add') {
      const num = json.push({"key": param.key, "values": [ { value: [ param.value ] } ] }) - 1;
      if(param.weight) json[num].values[0].weight = Math.max(param.weight, 1);
      if(param.chance) json[num].values[0].chance = Math.max(param.chance, 1);
      if(param.include !== undefined) json[num].include = param.include;
      if(param.min_wait || param.max_wait) json[num].values[0].wait = { min: Math.max(param.min_wait ?? 0, 0), max: Math.max(param.max_wait ?? param.min_wait, 0) };
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
    if(list.error) return sendMessage(`reply error: ${list.error.message}\n${list.error.stack}`, '1053457173314801686');
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
  sendMessage(inspect(error).slice(0,2000), '1053457173314801686');
});