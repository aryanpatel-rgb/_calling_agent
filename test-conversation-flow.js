import { replyFromLLM } from './src/brain/brain.js';

// Test the conversation flow with the LLM approach
async function testConversationFlow() {
  console.log('🧪 Testing LLM Conversation Flow\n');
  
  let history = [];
  
  // Test 1: Initial greeting
  console.log('=== Test 1: Initial Greeting ===');
  let response = await replyFromLLM(history, 'Hello', { name: 'John', email: 'john@example.com', service: 'New Customer Discovery Call' });
  console.log('Bot:', response.text);
  history = response.history;
  console.log('');
  
  // Test 2: User asks about services
  console.log('=== Test 2: User Asks About Services ===');
  response = await replyFromLLM(history, 'What services do you offer?', { name: 'John', email: 'john@example.com', service: 'New Customer Discovery Call' });
  console.log('Bot:', response.text);
  history = response.history;
  console.log('');
  
  // Test 3: User mentions a specific service
  console.log('=== Test 3: User Mentions Service ===');
  response = await replyFromLLM(history, 'I want a New Customer Discovery Call', { name: 'John', email: 'john@example.com', service: 'New Customer Discovery Call' });
  console.log('Bot:', response.text);
  history = response.history;
  console.log('');
  
  // Test 4: User provides name
  console.log('=== Test 4: User Provides Name ===');
  response = await replyFromLLM(history, 'My name is John Smith', { name: 'John', email: 'john@example.com', service: 'New Customer Discovery Call' });
  console.log('Bot:', response.text);
  history = response.history;
  console.log('');
  
  // Test 5: User provides email
  console.log('=== Test 5: User Provides Email ===');
  response = await replyFromLLM(history, 'My email is john@example.com', { name: 'John', email: 'john@example.com', service: 'New Customer Discovery Call' });
  console.log('Bot:', response.text);
  history = response.history;
  console.log('');
  
  // Test 6: User confirms
  console.log('=== Test 6: User Confirms ===');
  response = await replyFromLLM(history, 'Yes, that is correct', { name: 'John', email: 'john@example.com', service: 'New Customer Discovery Call' });
  console.log('Bot:', response.text);
  history = response.history;
  console.log('');
  
  // Test 7: User wants to change info
  console.log('=== Test 7: User Wants to Change Info ===');
  response = await replyFromLLM(history, 'Actually, I need to change my email', { name: 'John', email: 'john@example.com', service: 'New Customer Discovery Call' });
  console.log('Bot:', response.text);
  history = response.history;
  console.log('');
}

// Run the test
console.log('🚀 Starting LLM Conversation Flow Test\n');
console.log('='.repeat(50));

testConversationFlow().then(() => {
  console.log('='.repeat(50));
  console.log('✅ Test completed!');
}).catch(error => {
  console.error('❌ Test failed:', error);
});
