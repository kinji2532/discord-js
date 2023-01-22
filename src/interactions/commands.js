import cmdManager from './utils.js';
import { inspect } from 'util';

const cmd_manager = [
  {
    name: 'cmd_manager',
    description: 'slash command manager',
    options: [
      {
        name: 'add',
        description: 'add command',
        type: 1,
        options: [ { name: 'data', description: 'add data', type: 3, required: true } ]
      },
      {
        name: 'delete',
        description: 'delete command',
        type: 1,
        options: [ { name: 'id', description: 'remove id', type: 3, required: true } ]
      },
      {
        name: 'set',
        description: 'set command',
        type: 1,
        options: [ { name: 'data', description: 'set data', type: 3, required: true } ]
      },
      {
        name: 'list',
        description: 'list command',
        type: 1
      }
    ]
  }, async (message, response) => {
    const subCmd = message.data.options[0];

    switch(subCmd.name) {
      case 'add': {
        break;
      };
      case 'delete': {
        const id = subCmd.options[0].value;
        const res = await cmdManager.delete(id);

        return response.status(200).send({
          type: 4,
          data: { content: res ? 'NG':'OK' }
        });
      };
      case 'set': {
        break;
      };
      case 'list': {
        const res = await cmdManager.get();

        return response.status(200).send({
          type: 4,
          data: { content: res.map(d => `${d.name}: ${d.id}`).join('\n') }
        });
      };
    };
  }
];

const evalCode = [
  {
    name: 'eval',
    description: 'debug command',
    options: [ { name: 'data', description: 'code', type: 3, required: true } ]
  }, (message, response) => {
    const subCmd = message.data.options[0];

    try {
      const result = eval(subCmd.value);

      return response.status(200).send({
        type: 4,
        data: { content: inspect(result).slice(0,2000) }
      });
    } catch(e) {
      return response.status(200).send({
        type: 4,
        data: { content: inspect(e).slice(0,2000) }
      });
    }
  }
];

const modal = [
  {
    name: 'modal',
    description: 'create modal'
  }, async (message, response) => {
    response.status(200).send({
      type: 9,
      data: {
        custom_id: 'testModal',
        title: 'test modal',
        components: [
          {
            type: 1,
            components: [
              {
                "type": 4,
                "custom_id": "name",
                "label": "Name",
                "style": 1,
                "min_length": 1,
                "max_length": 4000,
                "placeholder": "John",
                "required": true
              }
            ]
          }
        ]
      }
    });
  }
];

export default { cmd_manager, evalCode, modal };