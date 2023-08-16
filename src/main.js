import { event } from './init.js';
import { sendMessage } from './functions.js';
import { inspect } from 'util';

event.once('ready', async () => {
  console.log('connected.');
  await sendMessage("self connected.");
});

