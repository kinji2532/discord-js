import { Interaction } from './src/functions.js';

const list = [
  '919862408837730345',
  //'506072711815233536'
]

test();

async function test() {
  list.forEach(async id => {
    console.log(await Interaction.set([
      {
        name: "reply",
        type: 1,
        description: "返信の管理",
        options: [
          {
            name: 'add',
            type: 1,
            description: '返信を追加',
            options: [
              { name: 'key', type: 3, description: '反応させる文字', required: true },
              { name: 'value', type: 3, description: '応答させる文字', required: true },
              { name: 'weight', type: 4, description: '応答確率' },
              { name: 'min_wait', type: 4, description: '最小待機時間' },
              { name: 'max_wait', type: 4, description: '最大待機時間' }
            ]
          },
          {
            name: 'remove',
            type: 1,
            description: '返信を削除',
            options: [
              { name: 'key', type: 3, description: 'this key', required: true },
              { name: 'value', type: 3, description: 'this value' }
            ]
          },
          {
            name: 'list',
            type: 1,
            description: '登録されている返信'
          }
        ]
      },
      {
        name: "eval",
        type: 1,
        description: "コードの実行",
        options: [ { name: 'code', type: 3, description: '実行するコード', required: true } ]
      }
    ], id));
  });
};