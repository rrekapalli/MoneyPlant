#!/usr/bin/env node

/**
 * Simple STOMP WebSocket test script for engines module
 * Tests STOMP WebSocket connection and subscription to NSE indices data
 */

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:8081/engines/ws/nse-indices/websocket';

console.log('🧪 Testing Engines STOMP WebSocket Connection');
console.log('============================================');
console.log(`WebSocket URL: ${WS_URL}`);
console.log('');

function testSTOMPWebSocket() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      console.log('✅ WebSocket connection established');
      
      // Send STOMP CONNECT frame
      const connectFrame = 'CONNECT\naccept-version:1.2\nheart-beat:10000,10000\n\n\x00';
      ws.send(connectFrame);
      console.log('📤 Sent STOMP CONNECT frame');
      
      // Subscribe to NSE indices topic
      setTimeout(() => {
        const subscribeFrame = 'SUBSCRIBE\nid:sub-0\ndestination:/topic/nse-indices\n\n\x00';
        ws.send(subscribeFrame);
        console.log('📤 Sent STOMP SUBSCRIBE frame to /topic/nse-indices');
      }, 1000);
    });
    
    ws.on('message', (data) => {
      const message = data.toString();
      console.log('📥 Received message:', message);
      
      if (message.includes('CONNECTED')) {
        console.log('✅ STOMP connection established successfully!');
      } else if (message.includes('MESSAGE')) {
        console.log('✅ Successfully received STOMP message!');
        // Close connection after successful message reception
        ws.close();
        resolve(true);
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
      reject(error);
    });
    
    ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket connection closed: ${code} - ${reason}`);
    });
    
    // Timeout after 15 seconds
    setTimeout(() => {
      console.log('⏰ Test timeout - closing connection');
      ws.close();
      reject(new Error('Test timeout'));
    }, 15000);
  });
}

async function runTest() {
  try {
    await testSTOMPWebSocket();
    console.log('');
    console.log('🎉 STOMP WebSocket test completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('✅ WebSocket connection established');
    console.log('✅ STOMP CONNECT frame sent');
    console.log('✅ STOMP SUBSCRIBE frame sent');
    console.log('✅ STOMP message received');
    console.log('');
    console.log('🚀 The engines STOMP WebSocket is working correctly!');
    
  } catch (error) {
    console.error('');
    console.error('❌ STOMP WebSocket test failed:', error.message);
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('1. Ensure engines module is running on port 8081');
    console.error('2. Check if STOMP WebSocket endpoints are properly configured');
    console.error('3. Verify CORS and WebSocket configuration');
    console.error('4. Check engines module logs for errors');
    console.error('5. Verify the WebSocket URL format');
    
    process.exit(1);
  }
}

// Run the test
runTest();
