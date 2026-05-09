#!/usr/bin/env node

/**
 * Error Handling Test Script for CodeRabbit
 * Tests error handling coverage and robustness
 */

const fs = require('fs');
const path = require('path');

// Error handling test results
const results = {
  timestamp: new Date().toISOString(),
  error_checks: {
    try_catch_blocks: 0,
    error_throws: 0,
    error_logging: 0,
    error_recovery: 0
  },
  total_functions: 0,
  error_handled_functions: 0,
  status: 'completed'
};

// Analyze source files for error handling patterns
function analyzeErrorHandling() {
  console.log('🔍 Analyzing error handling...');

  const sourceFiles = getSourceFiles();
  let tryCatchCount = 0;
  let throwCount = 0;
  let loggingCount = 0;
  let recoveryCount = 0;
  let totalFunctions = 0;

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');

    // Count functions
    const functionMatches = content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g);
    if (functionMatches) {
      totalFunctions += functionMatches.length;
    }

    // Check for try-catch blocks
    const tryCatchMatches = content.match(/try\s*\{[\s\S]*?\}\s*catch/g);
    if (tryCatchMatches) {
      tryCatchCount += tryCatchMatches.length;
    }

    // Check for throw statements
    const throwMatches = content.match(/throw\s+new\s+\w*\s*\(/g);
    if (throwMatches) {
      throwCount += throwMatches.length;
    }

    // Check for error logging
    if (content.includes('console.error') || content.includes('logger.error') ||
        content.includes('log.error')) {
      loggingCount++;
    }

    // Check for error recovery patterns
    if (content.includes('catch') && (content.includes('return') || content.includes('default'))) {
      recoveryCount++;
    }
  }

  results.error_checks.try_catch_blocks = tryCatchCount;
  results.error_checks.error_throws = throwCount;
  results.error_checks.error_logging = loggingCount;
  results.error_checks.error_recovery = recoveryCount;
  results.total_functions = totalFunctions;
  results.error_handled_functions = Math.min(tryCatchCount, totalFunctions);

  console.log(`📊 Try-catch blocks: ${tryCatchCount}`);
  console.log(`📊 Error throws: ${throwCount}`);
  console.log(`📊 Error logging: ${loggingCount}`);
  console.log(`📊 Error recovery: ${recoveryCount}`);
  console.log(`📊 Total functions: ${totalFunctions}`);
}

// Get all source files
function getSourceFiles() {
  const files = [];

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !['node_modules', 'dist', 'build', '.git', 'coverage'].includes(item)) {
        scanDir(fullPath);
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.ts'))) {
        files.push(fullPath);
      }
    }
  }

  scanDir('.');
  return files;
}

// Generate error handling report
function generateReport() {
  const reportPath = path.join('reports', 'error-report.json');
  const reportsDir = path.dirname(reportPath);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`✅ Error handling report saved to ${reportPath}`);
}

// Main execution
function main() {
  console.log('🚨 Running error handling tests...');

  try {
    analyzeErrorHandling();
    generateReport();

    console.log('✅ Error handling tests completed successfully');

    // Exit with success
    process.exit(0);
  } catch (error) {
    console.error('❌ Error handling test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, results };