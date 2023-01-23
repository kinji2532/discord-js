import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';
import getRawBody from 'raw-body';
import cmdList from './commands.js';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

const server = app.listen(process.env.PORT, function(){
    console.log("[interactions] listening to:", server.address());
});

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.get("/", function(req, res, next) {
  var param = {"hello":"world"};
  res.header('Content-Type', 'application/json; charset=utf-8')
  res.send(param);
});

app.post('/', async (request, response) => {
  const signature = request.headers["x-signature-ed25519"];
  const timestamp = request.headers["x-signature-timestamp"];
  const rawBody = await getRawBody(request);

  const isValidRequest = verifyKey(rawBody, signature, timestamp, process.env.PUBLIC_KEY);

  if (!isValidRequest) return response.status(401).send({ error: "Bad request signature" });

  const message = request.body || {};


  if (message.type === InteractionType.PING) {
    response.send({ type: InteractionResponseType.PONG });
  }
  else if (message.type === InteractionType.APPLICATION_COMMAND) {
    console.log('APPLICATION_COMMAND', message);

    const commandFunc = cmdList[message.data.name]?.[1];

    if(!commandFunc) return response.status(200).send({ content: "Unknown Command" });

    try {
      return commandFunc(message, response);
    } catch(e) {
      return response.status(200).send({ content: e.message });
    }
  } 
  else if(message.type === InteractionType.APPLICATION_MODAL_SUBMIT) {
    console.log('APPLICATION_MODAL_SUBMIT', message);
    const result =response.status(200).send({
      type: 4,
      data: { content: 'OK', flags: 64 }
    });
    return console.log(result.res);
  }
  else {
    console.log('?', message);
    response.status(200).send({ content: "Unknown Type" });
  }
});