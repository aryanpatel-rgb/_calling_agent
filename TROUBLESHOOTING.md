# 🔧 Troubleshooting Guide: AI Assistant Connection Issues

## 🚨 Problem: Only Getting "Connection to AI Assistant" Message

If you're only hearing "Connecting you to our assistant" and the AI doesn't respond, follow these steps:

## 📋 Step 1: Check Environment Variables

First, run the environment test:
```bash
node test-env.js
```

**CRITICAL**: Make sure you have a `.env` file with ALL these variables:
```env
# Required for AI to work
OPENAI_API_KEY=your_openai_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here

# Required for Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# CRITICAL: This must be your public URL (ngrok, etc.)
PUBLIC_BASE_URL=https://your-ngrok-url.ngrok.io
```

## 🌐 Step 2: Check Public URL Configuration

**MOST IMPORTANT**: Your `PUBLIC_BASE_URL` must be accessible from the internet!

1. **If using ngrok**: Make sure it's running and the URL is correct
2. **If using localhost**: This won't work! Twilio needs internet access
3. **Test your URL**: Visit `https://your-url.ngrok.io/health` in browser

## 🔍 Step 3: Test the System

### Health Check
```bash
curl http://localhost:3000/health
```

### WebSocket Test
Visit `http://localhost:3000/ws-test` in your browser to test WebSocket connection.

### Test OpenAI API
```bash
node test-env.js
```

## 🐛 Step 4: Check Logs

Start your server and watch the logs:
```bash
npm start
```

Look for these messages:
- ✅ `WebSocket connected from Twilio stream`
- ✅ `AI Assistant Anna is now active and ready to help!`
- ✅ `AI response generated successfully`

If you see errors, they'll help identify the issue.

## 🚀 Step 5: Common Fixes

### Fix 1: Missing PUBLIC_BASE_URL
```bash
# In your .env file, add:
PUBLIC_BASE_URL=https://your-ngrok-url.ngrok.io
```

### Fix 2: OpenAI API Key Issues
- Check your OpenAI API key is valid
- Ensure you have credits in your OpenAI account
- Verify the API key format

### Fix 3: WebSocket Connection Issues
- Make sure your public URL is accessible
- Check firewall settings
- Verify ngrok is running and stable

### Fix 4: Audio Processing Issues
- Check ElevenLabs API key and voice ID
- Ensure audio format compatibility

## 📞 Step 6: Test the Full Flow

1. **Start your server**: `npm start`
2. **Start ngrok**: `ngrok http 3000`
3. **Update .env**: Set `PUBLIC_BASE_URL` to your ngrok URL
4. **Restart server**: Stop and start again
5. **Make a test call**: Use Twilio to call your number

## 🔍 Debug Commands

### Check if WebSocket is working:
```bash
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" http://localhost:3000/media
```

### Check environment variables:
```bash
node -e "console.log(process.env.PUBLIC_BASE_URL)"
```

## 📱 Expected Behavior

When working correctly, you should hear:
1. "Hello! Connecting you to our AI assistant Anna..."
2. "Connection established. You can now speak with Anna."
3. **AI responds**: "Hi! I'm Anna, your AI booking assistant..."

## 🆘 Still Not Working?

If you're still having issues:

1. **Check the logs** for specific error messages
2. **Verify all API keys** are working
3. **Test WebSocket connection** using `/ws-test` endpoint
4. **Ensure ngrok is stable** and URL doesn't change
5. **Check Twilio webhook configuration** points to correct URL

## 📞 Support

Common issues and solutions:
- **"WebSocket upgrade failed"** → Check PUBLIC_BASE_URL
- **"OpenAI API error"** → Check API key and credits
- **"No audio response"** → Check ElevenLabs configuration
- **"Connection timeout"** → Check internet connectivity and ngrok

Remember: The most common issue is missing or incorrect `PUBLIC_BASE_URL` in your `.env` file!
