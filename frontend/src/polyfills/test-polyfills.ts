/**
 * Test file to verify Node.js globals polyfill is working
 * This can be used to debug polyfill issues
 */

export function testNodeGlobalsPolyfill(): void {
  console.log('Testing Node.js globals polyfill...');
  
  // Test global
  if (typeof (window as any).global !== 'undefined') {
    console.log('✅ global polyfill working');
  } else {
    console.error('❌ global polyfill failed');
  }
  
  // Test process
  if (typeof (window as any).process !== 'undefined') {
    console.log('✅ process polyfill working');
  } else {
    console.error('❌ process polyfill failed');
  }
  
  // Test Buffer
  if (typeof (window as any).Buffer !== 'undefined') {
    console.log('✅ Buffer polyfill working');
  } else {
    console.error('❌ Buffer polyfill failed');
  }
  
  // Test util
  if (typeof (window as any).util !== 'undefined') {
    console.log('✅ util polyfill working');
  } else {
    console.error('❌ util polyfill failed');
  }
  
  // Test events
  if (typeof (window as any).events !== 'undefined') {
    console.log('✅ events polyfill working');
  } else {
    console.error('❌ events polyfill failed');
  }
  
  // Test querystring
  if (typeof (window as any).querystring !== 'undefined') {
    console.log('✅ querystring polyfill working');
  } else {
    console.error('❌ querystring polyfill failed');
  }
  
  // Test url
  if (typeof (window as any).url !== 'undefined') {
    console.log('✅ url polyfill working');
  } else {
    console.error('❌ url polyfill failed');
  }
  
  // Test crypto
  if (typeof (window as any).crypto !== 'undefined') {
    console.log('✅ crypto polyfill working');
  } else {
    console.error('❌ crypto polyfill failed');
  }
  
  console.log('Node.js globals polyfill test completed');
} 