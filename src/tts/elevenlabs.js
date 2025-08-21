import axios from 'axios';
import { config } from '../config.js';
import { log } from '../utils/logger.js';

// 🚀 PERFORMANCE OPTIMIZATION: Reuse HTTP connections
const axiosInstance = axios.create({
  timeout: 8000,
  headers: {
    'Connection': 'keep-alive'
  }
});

export async function ttsToPcm16(text) {
  // 🚀 OPTIMIZATION: Use the fastest ElevenLabs settings
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${config.eleven.voiceId}/stream?optimize_streaming_latency=4&output_format=pcm_8000`;

  const headers = {
    'xi-api-key': config.eleven.apiKey,
    'Content-Type': 'application/json',
    'Accept': 'audio/wav'
  };

  const body = {
    text,
    voice_settings: {
      stability: 0.4, // Slightly reduced for faster generation
      similarity_boost: 0.7, // Slightly reduced for faster generation
      style: 0.0,
      use_speaker_boost: false // Disable for speed
    },
    model_id: "eleven_turbo_v2" // 🚀 USE FASTEST MODEL
  };

  log('ElevenLabs TTS request...');
  
  try {
    const resp = await axiosInstance.post(url, body, { 
      headers, 
      responseType: 'arraybuffer',
      timeout: 5000 // Reduced timeout for faster failure detection
    });
    
    const buf = Buffer.from(resp.data);
    log(`ElevenLabs TTS bytes: ${buf.length}`);
    return buf;
    
  } catch (error) {
    log('ElevenLabs TTS error:', error.message);
    
    // 🚀 FALLBACK: Try with even faster settings
    try {
      log('Trying fallback TTS settings...');
      const fallbackBody = {
        text,
        voice_settings: {
          stability: 0.2,
          similarity_boost: 0.5,
          use_speaker_boost: false
        }
      };
      
      const fallbackResp = await axiosInstance.post(url, fallbackBody, { 
        headers, 
        responseType: 'arraybuffer',
        timeout: 3000 
      });
      
      const buf = Buffer.from(fallbackResp.data);
      log(`ElevenLabs fallback TTS bytes: ${buf.length}`);
      return buf;
      
    } catch (fallbackError) {
      log('ElevenLabs fallback failed:', fallbackError.message);
      throw error;
    }
  }
}