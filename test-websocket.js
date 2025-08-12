#!/usr/bin/env node

/**
 * Simple WebSocket test script for engines module
 * Tests WebSocket connection and subscription to NSE indices data
 */

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:8081/engines/ws/nse-indices';

console.log('🧪 Testing Engines WebSocket Connection');
console.log('=====================================');
console.log(`WebSocket URL: ${WS_URL}`);
console.log('');

function testWebSocket() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      console.log('✅ WebSocket connection established');
      
      // Subscribe to all indices data
      const subscribeMessage = {
        action: 'subscribe',
        channel: 'nse-indices'
      };
      
      ws.send(JSON.stringify(subscribeMessage));
      console.log('📤 Sent subscription message:', subscribeMessage);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📥 Received message:', message);
        
        if (message.indices && message.indices.length > 0) {
          console.log('✅ Successfully received NSE indices data!');
          console.log(`   Number of indices: ${message.indices.length}`);
          console.log(`   Source: ${message.source}`);
          console.log(`   Timestamp: ${message.timestamp}`);
          
          // Close connection after successful data reception
          ws.close();
          resolve(true);
        }
      } catch (error) {
        console.error('❌ Error parsing message:', error);
        reject(error);
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
      reject(error);
    });
    
    ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket connection closed: ${code} - ${reason}`);
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('⏰ Test timeout - closing connection');
      ws.close();
      reject(new Error('Test timeout'));
    }, 10000);
  });
}

async function runTest() {
  try {
    await testWebSocket();
    console.log('');
    console.log('🎉 WebSocket test completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('✅ WebSocket connection established');
    console.log('✅ Subscription message sent');
    console.log('✅ NSE indices data received');
    console.log('');
    console.log('🚀 The engines WebSocket is working correctly!');
    
  } catch (error) {
    console.error('');
    console.error('❌ WebSocket test failed:', error.message);
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('1. Ensure engines module is running on port 8081');
    console.error('2. Check if WebSocket endpoints are properly configured');
    console.error('3. Verify CORS and WebSocket configuration');
    console.error('4. Check engines module logs for errors');
    
    process.exit(1);
  }
}

// Run the test
runTest();
