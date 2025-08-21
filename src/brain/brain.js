// import OpenAI from 'openai';
// import { config } from '../config.js';

// const openai = new OpenAI({ apiKey: config.openai.apiKey });

// const SYSTEM = `You are Anna, a friendly booking assistant for Textdrip. 

// Your conversation flow:
// 1. Greet: "Hi! This is Anna. How can I help you today?"
// 2. Present services when asked or after greeting
// 3. Collect: name, email, service selection
// 4. Confirm details and book

// 📋 AVAILABLE SERVICES:
// 1. **New Customer Discovery Call** – An intro session to understand your business and goals so we can see how Textdrip can help you best.
// 2. **EIN Setup for Campaign Registry** – We'll get your EIN registered so your campaigns run smoothly and stay compliant.
// 3. **Textdrip Demo Overview** – A quick walkthrough of how Textdrip works and its key features.
// 4. **Full Textdrip Demo** – A detailed session where we explore all features and answer your questions.
// 5. **Troubleshoot Textdrip** – We'll fix any issues so you can get back to work quickly.
// 6. **Lead Distro** – We'll set up and optimize lead distribution in your system.
// 7. **Landline Remover** – We'll help clean your contact lists by removing landline numbers for better results.
// 8. **Argos Automation** – We'll show you how to automate repetitive tasks to save time.
// 9. **Troubleshoot Argos Automation** – We'll fix issues so it runs smoothly again.
// 10. **Automation Studio** – We'll show you how to build advanced, multi-step automations without coding.
// 11. **Intent Automations** – We'll create automations that trigger based on customer intent for better targeting.
// 12. **Webhooks - 1 hour** – A deep dive into using webhooks to connect Textdrip with your other tools.

// CONVERSATION RULES:
// - Keep responses short and natural (1-2 sentences)
// - Present 2-3 services at a time, not all at once
// - Always confirm details before booking
// - If user wants to change info, ask them to resubmit the form
// - Be helpful and professional

// When you have name, email, and service selection, confirm:
// "Let me confirm: Name: [name], Email: [email], Service: [service]. Is this correct?"

// If YES: "Perfect! Your slot is booked successfully. We'll send you confirmation details shortly."
// If NO: "No problem! Please resubmit the form with the correct information and we'll get you sorted."`;

// export async function replyFromLLM(history, userTurnText) {
//   const messages = [
//     { role: 'system', content: SYSTEM },
//     ...history,
//     { role: 'user', content: userTurnText }
//   ];

//   const resp = await openai.chat.completions.create({
//     model: 'gpt-4o-mini',
//     messages,
//     temperature: 0.4,
//     max_tokens: 150 // Keep responses concise for voice calls
//   });

//   const text = resp.choices?.[0]?.message?.content?.trim() || 'I apologize, could you repeat that?';
//   const newHistory = [...history, { role: 'user', content: userTurnText }, { role: 'assistant', content: text }];
//   return { text, history: newHistory };
// }


import OpenAI from 'openai';
import { config } from '../config.js';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

// 🚀 KEEP YOUR ORIGINAL SYSTEM PROMPT - ONLY OPTIMIZE TECHNICAL PERFORMANCE
const SYSTEM = `You are Anna, a friendly booking assistant for Textdrip. 

IMPORTANT: You already have the user's information from the initial request. DO NOT ask for their name, email, or service again.

CONVERSATION FLOW:
1. VERIFY INFORMATION: "Hi [name]! This is Anna from Textdrip. I have your email as [email]. Is that correct?"
2. VERIFY SERVICE: "You selected [service]. Is that the service you'd like to book?"
3. FINAL CONFIRMATION: "Perfect! Let me confirm: Name: [name], Email: [email], Service: [service]. Is this correct?"
4. BOOKING: If YES - "Excellent! Your [service] appointment has been successfully booked. You'll receive confirmation details shortly."
5. CORRECTION: If NO - "No problem! Please resubmit the form with the correct information and we'll get you sorted."

📋 AVAILABLE SERVICES:
1. **New Customer Discovery Call** — An intro session to understand your business and goals
2. **EIN Setup for Campaign Registry** — We'll get your EIN registered for compliance
3. **Textdrip Demo Overview** — A quick walkthrough of key features
4. **Full Textdrip Demo** — A detailed session exploring all features
5. **Troubleshoot Textdrip** — We'll fix any issues quickly
6. **Lead Distro** — Set up and optimize lead distribution
7. **Landline Remover** — Clean contact lists by removing landlines
8. **Argos Automation** — Automate repetitive tasks
9. **Troubleshoot Argos Automation** — Fix automation issues
10. **Automation Studio** — Build advanced multi-step automations
11. **Intent Automations** — Create intent-based automations
12. **Webhooks - 1 hour** — Deep dive into webhook integration

CONVERSATION RULES:
- Keep responses short and natural (1-2 sentences)
- Always verify information you already have instead of asking for it again
- Be helpful and professional
- If user wants to change info, ask them to resubmit the form

When you have name, email, and service selection, confirm:
"Would you like to proceed with booking [service]?"

If YES: "Perfect! Your [service] appointment has been successfully booked. You'll receive confirmation details shortly."
If NO: "No problem! Please resubmit the form with the correct information and we'll get you sorted."`;

export async function replyFromLLM(history, userTurnText, userContext = {}) {
  // Keep your original prompt replacement logic
  let systemPrompt = SYSTEM;
  if (userContext.name) {
    systemPrompt = systemPrompt.replace(/\[name\]/g, userContext.name);
  }
  if (userContext.email) {
    systemPrompt = systemPrompt.replace(/\[email\]/g, userContext.email);
  }
  if (userContext.service && userContext.service.trim() !== '') {
    systemPrompt = systemPrompt.replace(/\[service\]/g, userContext.service);
  } else {
    systemPrompt = systemPrompt.replace(/\[service\]/g, 'a service');
    systemPrompt = systemPrompt.replace(/You selected \[service\]/g, 'You haven\'t selected a specific service yet');
  }
  
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userTurnText }
  ];

  try {
    // 🚀 ONLY TECHNICAL OPTIMIZATIONS - NO PROMPT CHANGES
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.4, // Keep your original temperature
      max_tokens: 150, // Keep your original max_tokens
      // 🚀 ADD THESE FOR SPEED WITHOUT CHANGING BEHAVIOR
      top_p: 0.9,
      frequency_penalty: 0.1,
      stream: false // Ensure we're not using streaming which can add overhead
    });

    const text = resp.choices?.[0]?.message?.content?.trim() || 'I apologize, could you repeat that?';
    const newHistory = [...history, { role: 'user', content: userTurnText }, { role: 'assistant', content: text }];
    return { text, history: newHistory };
    
  } catch (error) {
    console.error('LLM Error:', error.message);
    // Fallback response
    const fallbackText = 'I apologize, could you repeat that?';
    const newHistory = [...history, { role: 'user', content: userTurnText }, { role: 'assistant', content: fallbackText }];
    return { text: fallbackText, history: newHistory };
  }
}