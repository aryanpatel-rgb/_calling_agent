// utils/audio.js
// Audio conversion helpers for Twilio <Stream> media

// Table-based μ-law decoder (8-bit → 16-bit PCM)
const MULAW_DECODE_TABLE = new Int16Array(256);
(function initMulawTable() {
  for (let i = 0; i < 256; i++) {
    let mu = ~i;
    let sign = (mu & 0x80) ? -1 : 1;
    let exponent = (mu >> 4) & 0x07;
    let mantissa = mu & 0x0F;
    let magnitude = ((mantissa << 1) + 33) << (exponent + 2);
    MULAW_DECODE_TABLE[i] = sign * (magnitude - 132);
  }
})();

// Encode 16-bit PCM → μ-law byte
function linearToMulaw(sample) {
  let sign = (sample >> 8) & 0x80;
  if (sign !== 0) sample = -sample;
  if (sample > 32635) sample = 32635;

  sample = sample + 132;
  let exponent = Math.floor(Math.log(sample) / Math.log(2)) - 7;
  if (exponent < 0) exponent = 0;
  if (exponent > 7) exponent = 7;
  let mantissa = (sample >> (exponent + 3)) & 0x0F;
  let mu = ~(sign | (exponent << 4) | mantissa);
  return mu & 0xFF;
}

export function pcm16ToMulaw(pcm16Buf) {
  const samples = new Int16Array(pcm16Buf.buffer, pcm16Buf.byteOffset, pcm16Buf.length / 2);
  const out = Buffer.alloc(samples.length);
  for (let i = 0; i < samples.length; i++) {
    out[i] = linearToMulaw(samples[i]);
  }
  return out;
}

export function mulawToPcm16(mulawBuf) {
  const out = Buffer.alloc(mulawBuf.length * 2);
  for (let i = 0; i < mulawBuf.length; i++) {
    const s = MULAW_DECODE_TABLE[mulawBuf[i]];
    out.writeInt16LE(s, i * 2);
  }
  return out;
}

// Base64 helpers
export function mulawToBase64(mulawBuf) {
  return mulawBuf.toString('base64');
}

export function base64ToMulaw(b64) {
  return Buffer.from(b64, 'base64');
}
