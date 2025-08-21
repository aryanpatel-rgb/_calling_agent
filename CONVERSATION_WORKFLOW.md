# AI Agent Conversation Workflow

## Overview
This document outlines the conversation flow for Anna, the AI booking assistant for Textdrip services.

## Call Flow Sequence

### 1. Initial Connection
- **TwiML Response**: "Connecting you to our assistant. One moment please."
- **WebSocket Connection**: Establishes real-time audio streaming

### 2. Greeting Phase
- **Anna's Response**: "Hi! This is Anna. How can I help you today?"
- **Purpose**: Establish connection and introduce available services

### 3. Service Discovery
- **User Input**: User asks about services or mentions a specific service
- **Anna's Response**: Presents 2-3 services at a time from the available list
- **Available Services**:
  1. **New Customer Discovery Call** – Intro session to understand business and goals
  2. **EIN Setup for Campaign Registry** – EIN registration for compliance
  3. **Textdrip Demo Overview** – Quick walkthrough of features
  4. **Full Textdrip Demo** – Detailed exploration of all features
  5. **Troubleshoot Textdrip** – Fix any issues quickly
  6. **Lead Distro** – Set up and optimize lead distribution
  7. **Landline Remover** – Clean contact lists by removing landlines
  8. **Argos Automation** – Automate repetitive tasks
  9. **Troubleshoot Argos Automation** – Fix automation issues
  10. **Automation Studio** – Build advanced multi-step automations
  11. **Intent Automations** – Create intent-based automations
  12. **Webhooks - 1 hour** – Deep dive into webhook integration

### 4. Information Collection
- **Service Selection**: User specifies desired service
- **Name Collection**: Anna asks for user's name
- **Email Collection**: Anna asks for user's email address

### 5. Confirmation Phase
- **Anna's Response**: "Let me confirm: Name: [name], Email: [email], Service: [service]. Is this correct?"
- **User Response Options**:
  - **YES**: Proceeds to booking confirmation
  - **NO**: Anna asks user to resubmit the form

### 6. Booking Confirmation
- **If YES**: "Perfect! Your slot is booked successfully. We'll send you confirmation details shortly."
- **If NO**: "No problem! Please resubmit the form with the correct information and we'll get you sorted."

## Technical Implementation

### Conversation Management
- Uses OpenAI GPT-4o-mini for natural language understanding
- Maintains conversation history for context
- Processes audio through WebSocket streaming
- Text-to-speech conversion for Anna's responses

### Audio Processing
- Real-time audio streaming via Twilio Media Streams
- Speech-to-text conversion using OpenAI Whisper
- Turn-taking detection (1-second pause triggers response)
- PCM16 audio format with μ-law encoding for Twilio

### Error Handling
- Connection timeouts (10 seconds)
- Audio processing error recovery
- WebSocket state management
- Graceful fallbacks for failed operations

## Conversation Rules

### Response Guidelines
- Keep responses short and natural (1-2 sentences)
- Present services in small groups (2-3 at a time)
- Always confirm details before booking
- Use friendly, professional tone
- Handle corrections gracefully

### User Experience
- Clear service descriptions
- Simple confirmation process
- Easy correction path
- Consistent greeting and closing

## Testing

### Test Scenarios
1. **Happy Path**: Complete booking flow
2. **Service Inquiry**: User asks about available services
3. **Information Correction**: User needs to change details
4. **Error Recovery**: Handle invalid inputs gracefully
5. **Multiple Bookings**: User books multiple services

### Test Commands
```bash
# Test conversation flow
node test-conversation-flow.js

# Test WebSocket connection
node test-websocket.js

# Test call initiation
node test-initiate-call.js
```

## Troubleshooting

### Common Issues
1. **STT Errors**: Check audio format and OpenAI API key
2. **WebSocket Timeouts**: Verify connection stability
3. **Audio Quality**: Ensure proper PCM16 encoding
4. **Response Delays**: Check TTS processing time

### Debug Logging
- Enable detailed logging in `src/utils/logger.js`
- Monitor WebSocket connection states
- Track audio processing metrics
- Log conversation flow states

## Security Considerations

### Data Protection
- No persistent storage of user information
- Secure API key management
- WebSocket connection validation
- Input sanitization for all user inputs

### Compliance
- GDPR-compliant data handling
- Secure audio transmission
- Audit logging for debugging
- Privacy-focused conversation design

## Future Enhancements

### Planned Features
- Multi-language support
- Appointment scheduling integration
- CRM system integration
- Advanced analytics and reporting
- Voice recognition improvements
- Custom service configurations

### Scalability
- Load balancing for multiple calls
- Database integration for bookings
- Admin dashboard for service management
- API rate limiting and optimization
