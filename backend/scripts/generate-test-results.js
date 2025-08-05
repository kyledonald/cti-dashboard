#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const TEST_RESULTS_FILE = path.join(__dirname, '../test-results.json');
const JEST_OUTPUT_FILE = path.join(__dirname, '../jest-results.json');

console.log('🧪 Running tests and generating results...');

try {
  // Run tests with JSON output
  execSync('npm test -- --json --outputFile=jest-results.json --silent', {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });

  // Read Jest results
  const jestResults = JSON.parse(fs.readFileSync(JEST_OUTPUT_FILE, 'utf8'));

  // Transform Jest results to our format
  const testResults = [];
  let testId = 1;

  if (jestResults.testResults && Array.isArray(jestResults.testResults)) {
    jestResults.testResults.forEach((testFile, fileIndex) => {
      if (testFile.assertionResults && Array.isArray(testFile.assertionResults)) {
        testFile.assertionResults.forEach((test, testIndex) => {
          // Extract requirement ID from ancestor titles (e.g., "FR01: User Authentication & Dashboard Access" or "FR04-FR05: User Role Management")
          let requirementId = 'UNKNOWN';
          if (test.ancestorTitles && test.ancestorTitles.length > 0) {
            // Check first ancestor title for FR pattern
            const firstAncestorMatch = test.ancestorTitles[0].match(/^([A-Z]{2}\d+(?:-[A-Z]{2}\d+)?):/);
            if (firstAncestorMatch) {
              requirementId = firstAncestorMatch[1];
            } else if (test.ancestorTitles.length > 1) {
              // Check second ancestor title (for nested describes)
              const secondAncestorMatch = test.ancestorTitles[1].match(/^([A-Z]{2}\d+):/);
              if (secondAncestorMatch) {
                requirementId = secondAncestorMatch[1];
              }
            }
          }

          testResults.push({
            id: `${requirementId}-${testId++}`,
            requirementId: requirementId,
            name: test.title || `Test ${testId}`,
            description: test.title || `Test ${testId}`, // Use test name as description
            category: 'unit', // Default to unit, could be enhanced
            status: test.status === 'passed' ? 'pass' : 'fail',
            executionTime: test.duration ? test.duration / 1000 : 0, // Convert to seconds
            lastRun: new Date().toISOString(),
            errorMessage: test.status === 'failed' && test.failureMessages ? 
              test.failureMessages.join(', ') : undefined
          });
        });
      }
    });
  }

  // Create summary
  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.status === 'pass').length;
  const failedTests = testResults.filter(t => t.status === 'fail').length;
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  // Group by requirement
  const requirements = {};
  testResults.forEach(test => {
    if (!requirements[test.requirementId]) {
      requirements[test.requirementId] = {
        id: test.requirementId,
        testCount: 0,
        passedCount: 0,
        failedCount: 0,
        successRate: 0
      };
    }
    requirements[test.requirementId].testCount++;
    if (test.status === 'pass') {
      requirements[test.requirementId].passedCount++;
    } else {
      requirements[test.requirementId].failedCount++;
    }
  });

  // Calculate success rates for each requirement
  Object.values(requirements).forEach(req => {
    req.successRate = req.testCount > 0 ? Math.round((req.passedCount / req.testCount) * 100) : 0;
  });

  const output = {
    testResults,
    summary: {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      lastUpdated: new Date().toISOString()
    },
    requirements
  };

  // Write results to file
  fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(output, null, 2));

  console.log(`✅ Test results generated successfully!`);
  console.log(`📊 Summary: ${passedTests}/${totalTests} tests passed (${successRate}%)`);
  console.log(`📁 Results saved to: ${TEST_RESULTS_FILE}`);

  // Clean up Jest output file
  if (fs.existsSync(JEST_OUTPUT_FILE)) {
    fs.unlinkSync(JEST_OUTPUT_FILE);
  }

} catch (error) {
  console.error('❌ Error generating test results:', error.message);
  process.exit(1);
} 