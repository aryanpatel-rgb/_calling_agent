import axios from 'axios';
import { config } from '../config.js';
import { log } from '../utils/logger.js';

// We request 8kHz mono 16-bit PCM to match Twilio's expected format.
export async function ttsToPcm16(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${config.eleven.voiceId}/stream?optimize_streaming_latency=4&output_format=pcm_8000`;
// ↑ Requesting 8kHz directly to match Twilio's expected format

  const headers = {
    'xi-api-key': config.eleven.apiKey,
    'Content-Type': 'application/json',
    'Accept': 'audio/wav' // server returns raw PCM stream; some accounts require wav. Works with stream endpoint.
  };

  const body = {
    text,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.8
    }
  };

  log('ElevenLabs TTS request...');
  const resp = await axios.post(url, body, { headers, responseType: 'arraybuffer' });
  const buf = Buffer.from(resp.data);
  log(`ElevenLabs TTS bytes: ${buf.length}`);
  return buf; // raw PCM16 (per selected format); if wav, strip header (TODO) — many tenants return PCM chunks already.
}
