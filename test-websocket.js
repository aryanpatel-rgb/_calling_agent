import WebSocket from 'ws';

// Test WebSocket connection to your server
const testWebSocket = () => {
  const wsUrl = 'ws://localhost:3000/media?name=Test&email=test@example.com&service=test';
  
  console.log('Testing WebSocket connection to:', wsUrl);
  
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', () => {
    console.log('✅ WebSocket connected successfully!');
    
    // Send a test message
    ws.send(JSON.stringify({
      event: 'start',
      start: { streamSid: 'test-stream' }
    }));
    
    // Close after 2 seconds
    setTimeout(() => {
      console.log('Closing test connection...');
      ws.close();
    }, 2000);
  });
  
  ws.on('message', (data) => {
    console.log('📨 Received message:', data.toString());
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket closed');
  });
  
  // Timeout after 5 seconds
  setTimeout(() => {
    if (ws.readyState === WebSocket.CONNECTING) {
      console.error('❌ Connection timeout - WebSocket server may not be running');
      ws.terminate();
    }
  }, 5000);
};

// Run the test
testWebSocket();
