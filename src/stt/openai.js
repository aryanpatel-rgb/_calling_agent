import OpenAI from 'openai';
import { config } from '../config.js';
import { log } from '../utils/logger.js';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function transcribePcm16ToText(pcm16Buffer) {
  try {
    // Encode PCM16 to WAV in memory (no tmp files needed)
    const wavBuffer = pcm16ToWav(pcm16Buffer);

    const resp = await openai.audio.transcriptions.create({
      file: new File([wavBuffer], "audio.wav", { type: "audio/wav" }),
      model: "whisper-1"
    });

    return resp.text?.trim();
  } catch (err) {
    log("STT error", err.message);
    return "";
  }
}

// --- helper: wrap raw PCM16 into minimal WAV header
function pcm16ToWav(pcm16Buffer, sampleRate = 8000) {
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcm16Buffer.length;

  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM header size
  buffer.writeUInt16LE(1, 20);  // audio format = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  pcm16Buffer.copy(buffer, 44);

  return buffer;
}
