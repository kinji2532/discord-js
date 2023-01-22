import EventEmitter from 'events';
import ws from 'ws';
import { sendMessage } from './functions.js';

import './interactions/index.js';

import dotenv from 'dotenv';
dotenv.config();

const event = new EventEmitter();

const reconnect = {
  url: 'wss://gateway.discord.gg'
};

connect();

function connect() {
  const connection = new ws(reconnect.url + '/?v=6&encoding=json');
  connection.onmessage = e => {
    const data = JSON.parse(e.data);

    if(data.op === 1) {
      sendMessage('op 1 request', '1053457173314801686');
      connection.send(`{ "op": 1, "d": ${reconnect.s||null} }`);
    }
    else if(data.op === 7) {
      connection.send(JSON.stringify({
        "op": 6,
        "d": {
          "token": process.env.SELF_TOKEN,
          "session_id": reconnect.session_id,
          "seq": reconnect.s
        }
      }));
    }
    else if(data.op === 9) {
      sendMessage('op 9 request', '1053457173314801686');
      connection.close();
    }
    else if(data.op === 10) {
      sendMessage('op 10 request', '1053457173314801686');
      const interval = data.d.heartbeat_interval;
      connection.send(JSON.stringify({
        "op": 2,
        "d": {
          "token": process.env.SELF_TOKEN,
          "capabilities": 125,
          "properties": {
            "os": "Windows", "browser": "Chrome", "device": "", "system_locale": "en-US",
            "browser_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36",
            "browser_version": "94.0.4606.61", "os_version": "10", "referrer": "", "referring_domain": "",
            "referrer_current": "", "referring_domain_current": "", "release_channel": "stable",
            "client_build_number": 99811, "client_event_source": null
          },
          "presence": { "status": "offline", "since": 0, "activities": [], "afk": false },
          "compress": false,
          "client_state": { "guild_hashes": {}, "highest_last_message_id": "0", "read_state_version": 0, "user_guild_settings_version": -1 }
        }
      }));

      setInterval(() => {
        connection.send(`{ "op": 1, "d": ${reconnect.s||null} }`);
      }, interval);
      return;
    }
    else if(data.op !== 0 && data.op !== 11) sendMessage('op ' +data.op + ' request', '1053457173314801686');

    reconnect.s = data.s;

    if(!data.t || ![ 'READY', 'MESSAGE_CREATE', 'MESSAGE_REACTION_ADD', 'INTERACTION_CREATE' ].includes(data.t)) return;

    event.emit(data.t?.toLowerCase(), data.d);

    //console.log(new Date(), data.t?.toLowerCase());
  };

  connection.onclose = () => {
    console.log('reconnected.');
    connect();
  };

  connection.onerror = error => {
    sendMessage('error', '1053457173314801686');
    console.log("エラー発生イベント受信", error.data);
  };
};

export { event, reconnect };