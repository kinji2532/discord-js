import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config();

test();

async function test() {
  console.log(await (await fetch(`https://discord.com/api/v10/webhooks/506254167325671424/aW50ZXJhY3Rpb246MTA2NzI0MTg0NzQ4OTA0ODU4NzpSRkdPbER6UHhoeEttVnE0WHVFQXBzdVd1MjVDa2pxaWIySEdReEpKdklOZFBTSEpDWHJEZzZYY0NHS2VnNlpYclE1NXJZUlh6dEs5ZkN3ZjZ5TXFGb1BKdG5XQXBGb2RIRjBqdEdCbUVadG04UDExNjkwTm9sMHo0TUx6SjNadg/messages/@original`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": 'Bot ' + process.env.BOT_TOKEN
    },
    method: "PATCH",
    body: JSON.stringify({ content: 'A' })
  })).json());
};