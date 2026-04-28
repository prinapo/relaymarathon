const fs = require('fs');
const path = require('path');

const resultsFile = path.join(__dirname, '..', 'test-results', 'results.json');

if (!fs.existsSync(resultsFile)) {
  console.log('No test results found at', resultsFile);
  process.exit(0);
}

const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

// Aggregate by file
const fileStats = {};

for (const suite of results.suites || []) {
  for (const spec of suite.specs || []) {
    const file = spec.file;
    if (!fileStats[file]) {
      fileStats[file] = { passed: 0, failed: 0, skipped: 0, total: 0 };
    }
    for (const test of spec.tests || []) {
      fileStats[file].total++;
      if (test.status === 'passed') fileStats[file].passed++;
      else if (test.status === 'failed') fileStats[file].failed++;
      else if (test.status === 'skipped') fileStats[file].skipped++;
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log('TEST SUMMARY BY FILE');
console.log('='.repeat(60));

const files = Object.keys(fileStats).sort();
let totalPassed = 0, totalFailed = 0, totalSkipped = 0, totalTests = 0;

for (const file of files) {
  const stats = fileStats[file];
  const status = stats.failed > 0 ? '❌' : '✓';
  console.log(`${status} ${file}`);
  console.log(`   Passed: ${stats.passed}, Failed: ${stats.failed}, Skipped: ${stats.skipped}, Total: ${stats.total}`);
  totalPassed += stats.passed;
  totalFailed += stats.failed;
  totalSkipped += stats.skipped;
  totalTests += stats.total;
}

console.log('='.repeat(60));
console.log(`TOTAL: ${totalTests} tests, Passed: ${totalPassed}, Failed: ${totalFailed}, Skipped: ${totalSkipped}`);
console.log('='.repeat(60) + '\n');

// Also write a summary file
const summaryPath = path.join(__dirname, '..', 'test-results', 'summary.txt');
const summaryLines = [
  'TEST SUMMARY BY FILE',
  '='.repeat(60),
  ...files.map(file => {
    const s = fileStats[file];
    return `${s.failed > 0 ? 'FAILED' : 'PASSED'} ${file}: ${s.passed} passed, ${s.failed} failed, ${s.skipped} skipped, ${s.total} total`;
  }),
  '='.repeat(60),
  `TOTAL: ${totalTests} tests, Passed: ${totalPassed}, Failed: ${totalFailed}, Skipped: ${totalSkipped}`,
  '='.repeat(60),
];
fs.writeFileSync(summaryPath, summaryLines.join('\n'));
console.log(`Summary written to ${summaryPath}`);
