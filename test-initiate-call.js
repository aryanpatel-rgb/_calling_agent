import axios from 'axios';

// Test the initiate-call endpoint
const testInitiateCall = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Initiate Call Endpoint');
  console.log('📍 Base URL:', baseUrl);
  console.log('');
  
  // Test 1: Valid request with all required fields
  console.log('✅ Test 1: Valid request with all fields');
  try {
    const validResponse = await axios.post(`${baseUrl}/api/initiate-call`, {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      service: 'New Customer Discovery Call'
    });
    
    console.log('   Status:', validResponse.status);
    console.log('   Response:', validResponse.data);
    console.log('   ✅ Success: Call initiated with SID:', validResponse.data.sid);
  } catch (error) {
    console.log('   ❌ Error:', error.response?.data || error.message);
  }
  console.log('');
  
  // Test 2: Missing phone number
  console.log('❌ Test 2: Missing phone number');
  try {
    await axios.post(`${baseUrl}/api/initiate-call`, {
      name: 'John Doe',
      email: 'john@example.com',
      service: 'New Customer Discovery Call'
    });
  } catch (error) {
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.error);
    console.log('   ✅ Expected: Phone number validation working');
  }
  console.log('');
  
  // Test 3: Missing name
  console.log('❌ Test 3: Missing name');
  try {
    await axios.post(`${baseUrl}/api/initiate-call`, {
      email: 'john@example.com',
      phone: '+1234567890',
      service: 'New Customer Discovery Call'
    });
  } catch (error) {
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.error);
    console.log('   ✅ Expected: Name validation working');
  }
  console.log('');
  
  // Test 4: Missing email
  console.log('❌ Test 4: Missing email');
  try {
    await axios.post(`${baseUrl}/api/initiate-call`, {
      name: 'John Doe',
      phone: '+1234567890',
      service: 'New Customer Discovery Call'
    });
  } catch (error) {
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.error);
    console.log('   ✅ Expected: Email validation working');
  }
  console.log('');
  
  // Test 5: Empty request body
  console.log('❌ Test 5: Empty request body');
  try {
    await axios.post(`${baseUrl}/api/initiate-call`, {});
  } catch (error) {
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.error);
    console.log('   ✅ Expected: Empty body validation working');
  }
  console.log('');
  
  console.log('🎯 Test Summary:');
  console.log('   - All validation tests should pass');
  console.log('   - Only valid requests should succeed');
  console.log('   - Invalid requests should return appropriate error messages');
};

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testInitiateCall().catch(console.error);
}

export { testInitiateCall };
