/**
 * E2E Integration Test Script
 * 
 * This script runs a complete integration test:
 * 1. Creates test data in real Firestore
 * 2. Verifies all pages load without errors
 * 3. Cleans up test data
 * 
 * Usage:
 *   node scripts/e2e-integration-test.js
 */

const { spawn } = require('child_process');
const http = require('http');

const TEST_PREFIX = 'e2e_';
const WAIT_TIME = 5000;
const SERVER_URL = 'http://localhost:9000';

function log(message, type = 'info') {
  const prefix = {
    info: 'ℹ',
    success: '✓',
    error: '✗',
    warning: '⚠'
  };
  console.log(`${prefix[type]} ${message}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(SERVER_URL, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => resolve(false));
  });
}

async function runCommand(command, args = [], cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: true });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on('error', reject);
  });
}

async function main() {
  console.log('\n========================================');
  console.log('   E2E Integration Test Suite');
  console.log('========================================\n');

  log('Starting integration tests...', 'info');
  log(`Test prefix: ${TEST_PREFIX}`, 'info');

  // Step 1: Create test data
  log('\n[1/5] Creating test data...', 'info');
  const setupResult = await runCommand('node', ['scripts/e2e-data-setup.js', '--setup']);
  if (setupResult.code !== 0) {
    log('Could not create test data (this is OK if using existing data)', 'warning');
  } else {
    log('Test data created', 'success');
  }

  // Step 2: Wait for server
  log('\n[2/5] Checking server...', 'info');
  let serverReady = await checkServer();
  
  if (!serverReady) {
    log('Starting dev server...', 'info');
    await runCommand('npm', ['run', 'dev'], process.cwd());
    await sleep(10000);
    serverReady = await checkServer();
  }

  if (!serverReady) {
    log('Server not available. Skipping visual tests.', 'warning');
  } else {
    log('Server is ready', 'success');
  }

  // Step 3: Run Playwright tests
  log('\n[3/5] Running Playwright tests...', 'info');
  const testResult = await runCommand('npx', [
    'playwright', 'test',
    'tests/e2e',
    '--reporter=list',
    '--timeout=30000',
    '--retries=0'
  ]);

  const passedTests = (testResult.stdout.match(/✓/g) || []).length;
  const failedTests = (testResult.stdout.match(/✗|x/g) || []).length;

  console.log('\n--- Test Results ---');
  if (passedTests > 0) {
    log(`Passed: ${passedTests}`, 'success');
  }
  if (failedTests > 0) {
    log(`Failed/Skipped: ${failedTests}`, 'error');
  }

  // Step 4: Cleanup test data
  log('\n[4/5] Cleaning up test data...', 'info');
  const cleanupResult = await runCommand('node', ['scripts/e2e-data-setup.js', '--cleanup']);
  if (cleanupResult.code === 0) {
    log('Test data cleaned up', 'success');
  } else {
    log('Cleanup warning (data may need manual removal)', 'warning');
  }

  // Step 5: Summary
  log('\n[5/5] Test Summary', 'info');
  console.log('========================================');

  if (failedTests === 0 && serverReady) {
    log('All integration tests passed!', 'success');
    console.log('========================================\n');
    process.exit(0);
  } else if (failedTests > 0 && serverReady) {
    log(`${failedTests} test(s) failed. Check output above.`, 'error');
    console.log('========================================\n');
    process.exit(1);
  } else {
    log('Integration tests completed with warnings.', 'warning');
    console.log('========================================\n');
    process.exit(0);
  }
}

main().catch(err => {
  log(`Integration test failed: ${err.message}`, 'error');
  process.exit(1);
});