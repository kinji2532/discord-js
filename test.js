const fetch = require('node-fetch');
const fs = require('fs');

require('dotenv').config();

test();

async function test() {
  fs.writeFileSync('test.ts', Buffer.from((await (await fetch(
    'https://api.github.com/repos/DefinitelyTyped/DefinitelyTyped/contents/types/mojang-minecraft/index.d.ts'
  )).json()).content, 'base64').toString());
};