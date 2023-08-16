export interface BaseMessage {
  id: string;
  type: number;
  channel_id: string;
  author: any;
  content: string;
  embeds: any[];
  attachments: any[];
  mentions: any[];
  reactions?: any[];
  components: any[];
  timestamp: Date;
  pinned: boolean;
};

export interface SendMessageData {
  content?: string;
  tts?: boolean;
  embeds?: Embed[];
  attachments?: any[];
  components?: any[];
  flags?: number;
}

export interface BaseChannel {
  id: string;
  type: number;
  last_message_id?: string;
  flags?: number;
  guild_id?: string;
  name: string;
  parent_id?: string;
  rate_limit_per_user?: number;
  topic?: string;
  position?: number;
  permission_overwrites?: any[];
  nsfw?: boolean;
}

export interface BaseGuild {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  home_header?: string;
  splash?: string;
  discovery_splash?: string;
  features?: string[];
  banner?: string;
  owner_id: string;
  application_id?: string;
  region?: string;
  afk_channel_id?: string;
  afk_timeout?: number;
  system_channel_id?: string;
  system_channel_flags?: number;
  widget_enabled?: boolean;
  widget_channel_id?: string;
  verification_level?: number;
  roles?: any[];
  default_message_notifications?: number;
  mfa_level?: number;
  explicit_content_filter?: number;
  max_presences?: string;
  max_members?: number;
  max_stage_video_channel_users?: number;
  max_video_channel_users?: number;
  vanity_url_code?: string;
  premium_tier?: number;
  premium_subscription_count?: number;
  preferred_locale?: string;
  rules_channel_id?: string;
  safety_alerts_channel_id?: string;
  public_updates_channel_id?: string;
  hub_type?: number;
  premium_progress_bar_enabled?: boolean;
  latest_onboarding_question_id?: string;
  nsfw?: boolean;
  nsfw_level?: number;
  emojis?: any[];
  stickers?: any[];
  incidents_data?: any;
  inventory_settings?: any;
  embed_enabled?: boolean;
  embed_channel_id?: string;
}

export interface BaseUser {
  id: string;
  username: string;
  avatar?: string;
  discriminator: string;
  public_flags?: number;
  flags?: number;
  banner?: string;
  accent_color?: string;
  global_name: string;
  avatar_decoration?: string;
  banner_color?: string
};

export interface BaseEmbed {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: Date;
  color?: string;
  footer?: { text: string; icon_url?: string; proxy_icon_url?: string; };
  image?: { url: string; proxy_url?: string; height?: number; width?: number; };
  thumbnail?: { url: string; proxy_url?: string; height?: number; width?: number; };
  video?: { url?: string; proxy_url?: string; height?: number; width?: number; };
  provider?: { name?: string; url?: string; };
  author?: { name: string; url?: string; icon_url?: string; proxy_icon_url?: string; };
  fields?: { name: string; value: string; inline?: boolean; }[];
};

export class Message {
  id: string;
  author: User;
  content?: string;
  timestamp: Date;
  pinned: boolean;
  channel: Channel;
  guild: Guild;
};

export class Channel {
  id: string;
  name: string;
  type: number;
  position?: number;
  parent_id?: string;
  last_message_id?: string;
  guild: Guild;
  send: (data: string | SendMessageData, type?: string) => Promise<Message>
};

export class Guild {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  owner_id: string;
  banner?: string;
  nsfw?: boolean;
  roles?: any[];
  emojis?: any[];
  stickers?: any[];
}

export class User {
  id: string;
  username: string;
  avatar?: string;
  discriminator: string;
  banner?: string;
  accent_color?: string;
  global_name: string;
  avatar_decoration?: string;
  banner_color?: string;
};