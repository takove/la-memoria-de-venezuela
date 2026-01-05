#!/usr/bin/env node
/**
 * Simple diagnostic test for Tier 1 implementation
 * Tests basic connectivity without full pipeline
 */

const http = require('http');

function testEndpoint(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('\n🔍 Tier 1 Diagnostics...\n');

  // Test 1: Server alive?
  console.log('1. Testing server connectivity...');
  try {
    const res = await testEndpoint('/officials');
    console.log(`   ✅ Server responding (status: ${res.status})`);
  } catch (err) {
    console.log(`   ❌ Server not responding: ${err.message}`);
    return;
  }

  // Test 2: Tier1 routes registered?
  console.log('\n2. Testing Tier1 routes...');
  const tests = [
    { path: '/tier1/stats', method: 'GET' },
    { path: '/tier1/officials', method: 'GET' },
    { path: '/tier1/import/ofac', method: 'POST' },
  ];

  for (const test of tests) {
    try {
      const res = await testEndpoint(test.path, test.method);
      const success = res.status < 500;
      const icon = success ? '✅' : '❌';
      console.log(`   ${icon} ${test.method} ${test.path} → ${res.status}`);
      if (res.status === 404) {
        console.log(`      (Route not found - controller not registered)`);
      } else if (res.status >= 500) {
        console.log(`      Error: ${res.data.slice(0, 100)}`);
      }
    } catch (err) {
      console.log(`   ❌ ${test.method} ${test.path} → ERROR: ${err.message}`);
    }
  }

  // Test 3: Ingestion routes (should exist)
  console.log('\n3. Testing existing Ingestion routes (control)...');
  try {
    const res = await testEndpoint('/ingestion/queue');
    console.log(`   ✅ GET /ingestion/queue → ${res.status}`);
  } catch (err) {
    console.log(`   ❌ GET /ingestion/queue → ERROR: ${err.message}`);
  }

  console.log('\n✅ Diagnostics complete\n');
}

main().catch(console.error);
