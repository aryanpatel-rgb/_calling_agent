# Troubleshooting Guide

## Environment Setup

Before running the application, you need to create a `.env` file with the following variables:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here

# Server Configuration
PORT=3000
PUBLIC_BASE_URL=https://your-ngrok-url.ngrok.io
```

## 🎯 **New Conversation Flow**

The system now implements an improved conversation flow:

1. **Call Initiation**: User calls `/api/initiate-call` with name, email, phone, and service
2. **TwiML Greeting**: "Hello! Thank you for calling. I'm connecting you to Anna, your personal booking assistant who will confirm your details and help schedule your appointment. One moment please."
3. **AI Greeting**: "Hi [Name]! I'm Anna, your booking assistant. I have your email as [email]. Is that correct?"
4. **User Confirmation**: User confirms details
5. **Service & Time**: Anna asks for service details and preferred time
6. **Appointment Booking**: Anna confirms and books appointment for tomorrow

## Testing

### Test the Complete Flow
```bash
# Test conversation flow
node test-conversation-flow.js

# Test initiate-call endpoint
node test-initiate-call.js

# Test WebSocket connection
node test-websocket.js
```

### Expected Behavior
- **TwiML**: Professional greeting setting expectations
- **AI Greeting**: Personalized confirmation of user details
- **Conversation**: Natural flow to book appointment
- **Booking**: Confirmation for tomorrow's appointment

## Common Issues

### WebSocket Connection Failures
- Ensure `PUBLIC_BASE_URL` is set to your public URL (e.g., ngrok URL)
- Check that the WebSocket server is running on the correct port
- Verify firewall settings allow WebSocket connections

### Audio Transcription Issues
- Ensure OpenAI API key is valid and has sufficient credits
- Check that audio is being received in the correct format (PCM16)
- Verify the audio buffer size is appropriate for transcription

### TTS (Text-to-Speech) Issues
- Ensure ElevenLabs API key is valid
- Check that the voice ID exists in your ElevenLabs account
- Verify the audio format conversion is working correctly

### Twilio Call Issues
- Ensure Twilio credentials are correct
- Check that the phone number is verified in your Twilio account
- Verify the TwiML generation is working correctly

### Validation Issues
- **Name Required**: Call initiation requires user's name
- **Email Required**: Call initiation requires user's email
- **Phone Required**: Call initiation requires phone number
- **Service Optional**: Service type is optional but recommended

## Logs

The application provides detailed logging. Check the console output for:
- WebSocket connection status
- Audio processing information
- API call results
- Error messages
- Conversation flow progression

## Debug Commands

### Check Environment Variables
```bash
node -e "console.log('PUBLIC_BASE_URL:', process.env.PUBLIC_BASE_URL)"
```

### Test WebSocket Connection
```bash
node test-websocket.js
```

### Test Complete Flow
```bash
node test-conversation-flow.js
```

### Test API Endpoints
```bash
node test-initiate-call.js
```
