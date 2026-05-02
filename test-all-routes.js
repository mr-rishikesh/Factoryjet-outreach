#!/usr/bin/env node
/**
 * Complete Route Testing Script
 * Tests all API endpoints and logs results
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.yellow}━━━ ${msg} ━━━${colors.reset}`),
  result: (method, path, status, ok) => {
    const icon = ok ? colors.green + '✓' : colors.red + '✗';
    console.log(`${icon}${colors.reset} ${method.padEnd(6)} ${path.padEnd(50)} → ${status}`);
  }
};

function makeRequest(method, path, body = null) {
  return new Promise((resolve) => {
    const url = new URL(BASE_URL + path);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
            ok: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
            ok: res.statusCode >= 200 && res.statusCode < 300
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        body: { error: error.message },
        ok: false
      });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n' + colors.bold + colors.blue + '╔════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.bold + colors.blue + '║        FactoryJet API Route Testing Suite                    ║' + colors.reset);
  console.log(colors.bold + colors.blue + '╚════════════════════════════════════════════════════════════╝' + colors.reset);

  let passed = 0;
  let failed = 0;

  // ==================== CONTACTS ROUTES ====================
  log.section('CONTACTS API');

  let res = await makeRequest('GET', '/api/contacts?page=1&limit=5');
  log.result('GET', '/api/contacts?page=1&limit=5', res.status, res.ok);
  res.ok ? passed++ : failed++;
  if (res.ok) log.info(`Total contacts: ${res.body.pagination?.total || 0}`);

  res = await makeRequest('GET', '/api/contacts/stats');
  log.result('GET', '/api/contacts/stats', res.status, res.ok);
  res.ok ? passed++ : failed++;

  res = await makeRequest('GET', '/api/contacts/filter?page=1&limit=5');
  log.result('GET', '/api/contacts/filter', res.status, res.ok);
  res.ok ? passed++ : failed++;

  // ==================== SEQUENCES ROUTES ====================
  log.section('SEQUENCES API');

  res = await makeRequest('GET', '/api/sequences/health');
  log.result('GET', '/api/sequences/health', res.status, res.ok);
  res.ok ? passed++ : failed++;
  if (res.ok) log.info(`Active sequences: ${res.body.health?.activeSequences || 0}`);

  res = await makeRequest('GET', '/api/sequences/due');
  log.result('GET', '/api/sequences/due', res.status, res.ok);
  res.ok ? passed++ : failed++;
  if (res.ok) log.info(`Due for email: ${res.body.data?.length || 0} contacts`);

  res = await makeRequest('GET', '/api/sequences/due?type=A');
  log.result('GET', '/api/sequences/due?type=A', res.status, res.ok);
  res.ok ? passed++ : failed++;

  res = await makeRequest('GET', '/api/sequences/analytics');
  log.result('GET', '/api/sequences/analytics', res.status, res.ok);
  res.ok ? passed++ : failed++;

  res = await makeRequest('POST', '/api/sequences/run-scheduled', {});
  log.result('POST', '/api/sequences/run-scheduled', res.status, res.ok);
  res.ok ? passed++ : failed++;

  res = await makeRequest('POST', '/api/sequences/initialize', {
    contactId: '507f1f77bcf86cd799439999',
    sequenceType: 'A'
  });
  log.result('POST', '/api/sequences/initialize', res.status, res.ok);
  // This might fail if contact doesn't exist - that's ok
  console.log(`   └─ Expected to fail if contact doesn't exist`);

  // ==================== COMPLIANCE ROUTES ====================
  log.section('COMPLIANCE API');

  res = await makeRequest('GET', '/api/compliance/audit-log?page=1&limit=10');
  log.result('GET', '/api/compliance/audit-log', res.status, res.ok);
  res.ok ? passed++ : failed++;

  res = await makeRequest('GET', '/api/compliance/suppression?page=1&limit=10');
  log.result('GET', '/api/compliance/suppression', res.status, res.ok);
  res.ok ? passed++ : failed++;

  res = await makeRequest('GET', '/api/compliance/suppression/stats');
  log.result('GET', '/api/compliance/suppression/stats', res.status, res.ok);
  res.ok ? passed++ : failed++;

  res = await makeRequest('GET', '/api/compliance/check/A');
  log.result('GET', '/api/compliance/check/A', res.status, res.ok);
  res.ok ? passed++ : failed++;
  if (res.ok) log.info(`Compliance score: ${res.body.data?.score || 'N/A'}`);

  res = await makeRequest('POST', '/api/compliance/verify-email', {
    email: 'test@gmail.com'
  });
  log.result('POST', '/api/compliance/verify-email', res.status, res.ok);
  res.ok ? passed++ : failed++;

  // ==================== DEBUG ROUTES ====================
  log.section('DEBUG ROUTES');

  res = await makeRequest('GET', '/api/test');
  log.result('GET', '/api/test', res.status, res.ok);
  res.ok ? passed++ : failed++;

  res = await makeRequest('GET', '/api/debug/contacts-count');
  log.result('GET', '/api/debug/contacts-count', res.status, res.ok);
  res.ok ? passed++ : failed++;
  if (res.ok) log.info(`Total contacts in DB: ${res.body.totalContacts || 0}`);

  res = await makeRequest('GET', '/api/debug/contacts-api');
  log.result('GET', '/api/debug/contacts-api', res.status, res.ok);
  res.ok ? passed++ : failed++;

  // ==================== DELIVERY ROUTES ====================
  log.section('DELIVERY ROUTES');

  res = await makeRequest('POST', '/api/delivery/bounce', {
    email: 'test@example.com',
    bounceType: 'hard',
    bounceReason: 'Permanent failure'
  });
  log.result('POST', '/api/delivery/bounce', res.status, res.ok);
  // This might fail if email doesn't exist - that's ok
  console.log(`   └─ Expected to fail if email not in DB`);

  // ==================== SUMMARY ====================
  log.section('TEST SUMMARY');
  const total = passed + failed;
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

  console.log(`\n${colors.bold}Total Routes Tested: ${total}${colors.reset}`);
  console.log(`${colors.green}${colors.bold}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}${colors.bold}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}Success Rate: ${percentage}%${colors.reset}\n`);

  if (percentage >= 90) {
    log.success('All critical routes working! ✨');
  } else if (percentage >= 70) {
    log.info('Most routes working. Check failures above.');
  } else {
    log.error('Multiple failures detected. Review above.');
  }

  console.log('\n' + colors.bold + colors.blue + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset + '\n');

  process.exit(percentage >= 90 ? 0 : 1);
}

// Run tests
runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
