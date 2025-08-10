#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEST_RESULTS_FILE = path.join(__dirname, '../test-results.json');
const JEST_OUTPUT_FILE = path.join(__dirname, '../jest-results.json');

console.log('Running tests...');

try {
  execSync('npm test -- --json --outputFile=jest-results.json --silent', {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });

  const jestResults = JSON.parse(fs.readFileSync(JEST_OUTPUT_FILE, 'utf8'));

  const testResults = [];
  let testId = 1;

  if (jestResults.testResults && Array.isArray(jestResults.testResults)) {
    jestResults.testResults.forEach((testFile, fileIndex) => {
      if (testFile.assertionResults && Array.isArray(testFile.assertionResults)) {
        testFile.assertionResults.forEach((test, testIndex) => {
          testResults.push({
            id: `test-${testId++}`,
            name: test.title || `Test ${testId}`,
            description: test.title || `Test ${testId}`,
            category: 'unit',
            status: test.status === 'passed' ? 'pass' : 'fail',
            executionTime: test.duration ? test.duration / 1000 : 0,
            lastRun: new Date().toISOString(),
            errorMessage: test.status === 'failed' && test.failureMessages ? 
              test.failureMessages.join(', ') : undefined
          });
        });
      }
    });
  }

  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.status === 'pass').length;
  const failedTests = testResults.filter(t => t.status === 'fail').length;
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  const output = {
    testResults,
    summary: {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      lastUpdated: new Date().toISOString()
    }
  };

  fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(output, null, 2));

  console.log(`Test results generated successfully!`);
  console.log(`Summary: ${passedTests}/${totalTests} tests passed (${successRate}%)`);
  console.log(`Results saved to: ${TEST_RESULTS_FILE}`);

  if (fs.existsSync(JEST_OUTPUT_FILE)) {
    fs.unlinkSync(JEST_OUTPUT_FILE);
  }

} catch (error) {
  console.error('Error generating test results:', error.message);
  process.exit(1);
} 
