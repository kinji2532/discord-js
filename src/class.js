//@ts-check
import {
  getChannel, getGuild, getMessage,
  sendMessage
} from './functions.js';

/** @typedef { import('./typedef.d.ts').BaseMessage } BaseMessage */
/** @typedef { import('./typedef.d.ts').SendMessageData } SendMessageData */
/** @typedef { import('./typedef.d.ts').BaseChannel } BaseChannel */
/** @typedef { import('./typedef.d.ts').BaseGuild } BaseGuild */
/** @typedef { import('./typedef.d.ts').BaseUser } BaseUser */
/** @typedef { import('./typedef.d.ts').BaseEmbed } BaseEmbed */

/** @type { import('./typedef.d.ts').Message } */
export class Message {
  #message = {};
  static #messages = new Map();
  /** @param { BaseMessage } msg  */
  constructor(msg) {
    this.#message = msg;
    this.id = msg.id;
    this.content = msg.content;
    if(msg.embeds.length) this.embeds = msg.embeds.map(embed => new Embed(embed));
    if(msg.attachments.length) this.attachments = msg.attachments;
    if(msg.components.length) this.components = msg.components;
    if(msg.reactions) this.reactions = msg.reactions;
    this.timestamp = msg.timestamp;
    this.pinned = msg.pinned;
    this.author = User.default();
    this.channel = Channel.default();
    this.guild = Guild.default();
  };
  /** @param { BaseMessage } msg */
  static async create(msg) {
    const message = new this(msg);
    if(!User.has(msg.author.id)) {
      await User.create(msg.author);
    }
    if(!Channel.has(msg.channel_id)) {
      await Channel.fetch(msg.channel_id);
    }
    message.author = User.get(msg.author.id);
    message.channel = Channel.get(msg.channel_id);
    message.guild = message.channel.guild;
    Message.#messages.set(msg.id, message);
    return message;
  };
  /** @param { string } id */
  static get(id) {
    return this.#messages.get(id);
  };
};

/** @type { import('./typedef.d.ts').Channel } */
export class Channel {
  #list = [];
  #channel = {};
  static #channels = new Map();
  /** @param { BaseChannel } ch */
  constructor(ch) {
    this.#channel = ch;
    this.id = ch.id;
    this.name = ch.name;
    this.type = ch.type;
    this.position = ch.position;
    if(ch.topic) this.topic = ch.topic;
    this.parent_id = ch.parent_id;
    this.last_message_id = ch.last_message_id;
    this.guild = Guild.default();
    Channel.#channels.set(ch.id, this);
  }
  /** @param { string | SendMessageData } data @param { string= } type */
  async send(data, type) {
    return Message.create(await sendMessage(data, this.id, type));
  };
  /** @param { string } id @returns { Channel } */
  static get(id) {
    return this.#channels.get(id);
  };
  /** @param { string } id */
  static async fetch(id) {
    const ch = await getChannel(id);
    return await this.create(ch);
  }
  /** @param { any } ch */
  static async create(ch) {
    const channel = new this(ch);
    if(!Guild.has(ch.guild_id)) {
      await Guild.fetch(ch.guild_id);
    }
    channel.guild = Guild.get(ch.guild_id);
    this.#channels.set(ch.id, channel);
    return ch;
  };
  /** @param { string } id */
  static has(id) {
    return this.#channels.has(id);
  };
  /** @returns { Channel } */
  static default() {
    return new this({ id: '', name: '', type: 0 });
  };
};

/** @type { import('./typedef.d.ts').Guild } */
export class Guild {
  #guild = {};
  static #guilds = new Map();
  /** @param { BaseGuild } guild */
  constructor(guild) {
    this.#guild = guild;
    this.id = guild.id;
    this.name = guild.name;
    if(guild.icon) this.icon = guild.icon;
    if(guild.description) this.description = guild.description;
    this.owner_id = guild.owner_id;
    if(guild.banner) this.banner = guild.banner;
    if(guild.nsfw) this.nsfw = guild.nsfw;
    if(guild.roles) this.roles = guild.roles;
    if(guild.emojis) this.emojis = guild.emojis;
    if(guild.stickers) this.stickers = guild.stickers;
  };
  /** @param { string } id @returns { Guild } */
  static get(id) {
    return this.#guilds.get(id);
  };
  /** @param { string } id  */
  static async fetch(id) {
    const gu = await getGuild(id);
    return await this.create(gu);
  }
  /** @param { BaseGuild } gu  */
  static async create(gu) {
    const guild = new this(gu);
    Guild.#guilds.set(guild.id, guild);
    return guild;
  };
  /** @param { string } id */
  static has(id) {
    return this.#guilds.has(id);
  };
  /** @returns { Guild } */
  static default() {
    return new this({ id: '', name: '', owner_id: '' });
  };
};

/** @type { import('./typedef.d.ts').User } */
export class User {
  #user = {};
  static #users = new Map();
  /** @param { BaseUser } user */
  constructor(user) {
    this.#user = user;
    this.id = user.id;
    this.username = user.username;
    this.global_name = user.global_name;
    if(user.avatar) this.avatar = user.avatar;
    this.discriminator = user.discriminator;
    if(user.banner) this.banner = user.banner;
    if(user.accent_color) this.accent_color = user.accent_color;
    if(user.avatar_decoration) this.avatar_decoration = user.avatar_decoration;
    if(user.banner_color) this.banner_color = user.banner_color;
  };
  /** @param { string } id @returns { User } */
  static get(id) {
    return this.#users.get(id);
  };
  /** @param { BaseUser } us */
  static async create(us) {
    const user = new this(us);
    User.#users.set(user.id, user);
    return user;
  };
  /** @param { string } id */
  static has(id) {
    return this.#users.has(id);
  };
  /** @returns { User } */
  static default() {
    return new this({ id: '', username: '', discriminator: '0', global_name: '' });
  };
};

export class Embed {
  #embed = {};
  /** @param { BaseEmbed } embed */
  constructor(embed) {
    this.#embed = embed;
    if(embed.title) this.title = embed.title;
    if(embed.description) this.description = embed.description;
    if(embed.url) this.url = embed.url;
    if(embed.timestamp) this.timestamp = embed.timestamp;
    if(embed.color) this.color = embed.color;
    if(embed.author) this.author = embed.author;
    if(embed.thumbnail) this.thumbnail = embed.thumbnail;
    if(embed.fields) this.fields = embed.fields;
    if(embed.image) this.image = embed.image;
    if(embed.video) this.video = embed.video;
    if(embed.provider) this.provider = embed.provider;
    if(embed.footer) this.footer = embed.footer;
  };
};

async function test() {
  const msg = await getMessage('637157711485730828', '1139103521128587395');
  const message = await Message.create(msg);

  //message.channel.send({ embeds: [{ title: 'test', description: 'hello', author: { name: 'tt' } }] });
  console.log(message.embeds?.[0].title);
};

test();