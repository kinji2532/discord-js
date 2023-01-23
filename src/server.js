import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';
import { event } from './init.js';
import getRawBody from 'raw-body';
import express from 'express';


const app = express();

const server = app.listen(process.env.PORT, () => {
  console.log("[interactions] listening to:", server.address());
});

app.post('/', async (request, response) => {
  const signature = request.headers["x-signature-ed25519"];
  const timestamp = request.headers["x-signature-timestamp"];
  const rawBody = await getRawBody(request);

  const isValidRequest = verifyKey(rawBody, signature, timestamp, process.env.PUBLIC_KEY);

  if (!isValidRequest) return response.status(401).send({ error: "Bad request signature" });

  const message = JSON.parse(rawBody.toString('utf-8')) || {};

  switch(message.type) {
    case InteractionType.PING:
      response.send({ type: InteractionResponseType.PONG });
      break;
    case InteractionType.APPLICATION_COMMAND:
      event.emit('application_command', message, response);
      break;
    case InteractionType.APPLICATION_MODAL_SUBMIT:
      event.emit('application_modal_submit', message, response);
      break;
  }
});