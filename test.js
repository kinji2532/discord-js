import { Interaction } from './src/functions.js';

test();

async function test() {
  console.log(await Interaction.set([
    {
      "name": "test",
      "type": 1,
      "description": "this is test"
    }
  ], '919862408837730345'));
};