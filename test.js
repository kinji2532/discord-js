import { Interaction } from './src/functions.js';

const list = [
//  '919862408837730345',
  '506072711815233536'
]

test();

async function test() {
  list.forEach(async id => {
    console.log(await Interaction.set([
      {
        name: "reply",
        type: 1,
        description: "this is test",
        options: [
          {
            name: 'add',
            type: 1,
            description: 'sub command',
            options: [
              { name: 'key', type: 3, description: 'this key', required: true },
              { name: 'value', type: 3, description: 'this value', required: true }
            ]
          },
          {
            name: 'remove',
            type: 1,
            description: 'sub command',
            options: [
              { name: 'key', type: 3, description: 'this key', required: true },
              { name: 'value', type: 3, description: 'this value' }
            ]
          }
        ]
      }
    ], id));
  });
};