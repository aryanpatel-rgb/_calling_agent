import OpenAI from 'openai';
import { config } from '../config.js';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

const SYSTEM = `You are Anna, a friendly booking assistant. 
Your job: greet the user, ask their name, email, desired service, and preferred time.
Keep replies short (1-2 sentences).`;

export async function replyFromLLM(history, userTurnText) {
  const messages = [
    { role: 'system', content: SYSTEM },
    ...history,
    { role: 'user', content: userTurnText }
  ];

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.4
  });

  const text = resp.choices?.[0]?.message?.content?.trim() || 'Okay.';
  const newHistory = [...history, { role: 'user', content: userTurnText }, { role: 'assistant', content: text }];
  return { text, history: newHistory };
}
