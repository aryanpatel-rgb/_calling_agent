import express from 'express';
import pkg from 'twilio';
const { twiml: TwiML } = pkg;
import { config } from '../config.js';
import { log } from '../utils/logger.js';

const router = express.Router();

/**
 * Helper to build correct ws/wss URL from http/https base
 */
function buildWsUrl(baseUrl, params) {
  const wsBase = baseUrl
    .replace(/^http:\/\//, 'ws://')
    .replace(/^https:\/\//, 'wss://');

  const query = new URLSearchParams(params).toString();
  return `${wsBase}/media?${query}`;
}

router.post('/voice/twiml', (req, res) => {
  const { name = '', email = '', service = '' } = { ...req.query, ...req.body };

  log('Generating TwiML for call:', { name, email, service });
  log('Public base URL:', config.publicBaseUrl);

  const twiml = new TwiML.VoiceResponse();
  twiml.say({ voice: 'Polly.Joanna' }, 'Connecting you to our assistant. One moment please.');

  const connect = twiml.connect();
  const wsUrl = buildWsUrl(config.publicBaseUrl, { name, email, service });
  log('WebSocket URL:', wsUrl);

  // Add custom parameters to the stream for better parameter passing
  const stream = connect.stream({ url: wsUrl });
  if (name) stream.parameter({ name: 'name', value: name });
  if (email) stream.parameter({ name: 'email', value: email });
  if (service) stream.parameter({ name: 'service', value: service });

  res.type('text/xml');
  const twimlString = twiml.toString();
  log('Generated TwiML:', twimlString);
  return res.send(twimlString);
});

router.get('/voice/twiml', (req, res) => {
  const { name = '', email = '', service = '' } = req.query;

  log('Generating TwiML for call (GET):', { name, email, service });
  log('Public base URL:', config.publicBaseUrl);

  const twiml = new TwiML.VoiceResponse();
  twiml.say({ voice: 'Polly.Joanna' }, 'Connecting you to our assistant. One moment please.');

  const connect = twiml.connect();
  const wsUrl = buildWsUrl(config.publicBaseUrl, { name, email, service });
  log('WebSocket URL:', wsUrl);

  // Add custom parameters to the stream for better parameter passing
  const stream = connect.stream({ url: wsUrl });
  if (name) stream.parameter({ name: 'name', value: name });
  if (email) stream.parameter({ name: 'email', value: email });
  if (service) stream.parameter({ name: 'service', value: service });

  res.type('text/xml');
  const twimlString = twiml.toString();
  log('Generated TwiML (GET):', twimlString);
  return res.send(twimlString);
});

export default router;
