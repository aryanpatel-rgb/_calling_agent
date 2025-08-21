import dotenv from 'dotenv';
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN', 
  'TWILIO_PHONE_NUMBER',
  'OPENAI_API_KEY',
  'ELEVENLABS_API_KEY',
  'ELEVENLABS_VOICE_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease create a .env file with these variables.');
  process.exit(1);
}

// Validate PUBLIC_BASE_URL
if (!process.env.PUBLIC_BASE_URL) {
  console.warn('⚠️  WARNING: PUBLIC_BASE_URL not set. This will cause WebSocket connections to fail.');
  console.warn('   Set PUBLIC_BASE_URL to your public URL (e.g., ngrok URL) in .env file');
}

export const config = {
  port: process.env.PORT || 3000,
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000',

  twilio: {
    sid: process.env.TWILIO_ACCOUNT_SID,
    auth: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_PHONE_NUMBER
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },

  eleven: {
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: process.env.ELEVENLABS_VOICE_ID
  }
};

// Log configuration (without sensitive data)
console.log('✅ Configuration loaded:');
console.log(`   Port: ${config.port}`);
console.log(`   Public URL: ${config.publicBaseUrl}`);
console.log(`   Twilio From: ${config.twilio.from}`);
console.log(`   OpenAI: Configured`);
console.log(`   ElevenLabs: Configured`);
