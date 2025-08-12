#!/usr/bin/env node

/**
 * Simple test script to verify engines API endpoints and CORS configuration
 * Run with: node test-engines-api.js
 */

const http = require('http');

const ENGINES_BASE_URL = 'http://localhost:8081/engines';

const endpoints = [
  '/actuator/health',
  '/api/nse-indices/ingestion/status',
  '/api/nse-indices/data/latest',
  '/api/nse-indices/health/websocket'
];

function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${ENGINES_BASE_URL}${endpoint}`;
    
    const options = {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:4200',
        'User-Agent': 'MoneyPlant-Frontend-Test'
      }
    };
    
    const req = http.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const corsHeaders = {
          'Access-Control-Allow-Origin': res.headers['access-control-allow-origin'],
          'Access-Control-Allow-Methods': res.headers['access-control-allow-methods'],
          'Access-Control-Allow-Headers': res.headers['access-control-allow-headers'],
          'Access-Control-Allow-Credentials': res.headers['access-control-allow-credentials']
        };
        
        console.log(`✅ ${endpoint}: ${res.statusCode} ${res.statusMessage}`);
        console.log(`   CORS Headers:`, corsHeaders);
        
        resolve({ 
          endpoint, 
          status: res.statusCode, 
          success: res.statusCode < 400,
          corsHeaders
        });
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${endpoint}: ${err.message}`);
      resolve({ endpoint, error: err.message, success: false });
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Engines API Endpoints and CORS Configuration');
  console.log('=====================================================');
  console.log(`Base URL: ${ENGINES_BASE_URL}`);
  console.log(`Frontend Origin: http://localhost:4200`);
  console.log('');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  console.log('');
  console.log('📊 Test Results Summary');
  console.log('========================');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`Total endpoints tested: ${total}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${total - successful}`);
  
  if (successful === total) {
    console.log('🎉 All endpoints are accessible!');
    
    // Check CORS configuration
    const hasCorsHeaders = results.some(r => 
      r.corsHeaders && r.corsHeaders['Access-Control-Allow-Origin']
    );
    
    if (hasCorsHeaders) {
      console.log('✅ CORS headers are present');
    } else {
      console.log('⚠️  CORS headers are missing - this may cause issues in the browser');
    }
  } else {
    console.log('⚠️  Some endpoints failed. Make sure the engines module is running.');
    console.log('   Run: cd scripts/linux/engines && ./start-engines.sh');
  }
  
  console.log('');
  console.log('🔍 Troubleshooting Tips:');
  console.log('1. Ensure engines module is running on port 8081');
  console.log('2. Check if CORS configuration is properly applied');
  console.log('3. Verify the engines module has restarted after CORS changes');
  console.log('4. Check browser console for detailed CORS errors');
}

// Check if engines module is running
console.log('🔍 Checking if engines module is accessible...');
runTests().catch(console.error);
