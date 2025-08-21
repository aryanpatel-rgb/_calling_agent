import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { config } from './config.js';
import { attachMediaWSServer } from './stream/media-ws.js';
import initiateRoute from './routes/initiate.js';
import twimlRoute from './routes/twiml.js';
import { log } from './utils/logger.js';

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(initiateRoute);
app.use(twimlRoute);

app.get('/', (_, res) => res.send('AI Calling Agent: up'));

const server = http.createServer(app);
attachMediaWSServer(server);

server.listen(config.port, () => {
  log(`Server on :${config.port}`);
  log(`Public base (for Twilio): ${config.publicBaseUrl}`);
});
