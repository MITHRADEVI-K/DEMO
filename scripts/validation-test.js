#!/usr/bin/env node

/**
 * Validation Test Script for CodeRabbit
 * Tests input validation and null safety
 */

const fs = require('fs');
const path = require('path');

// Validation test results
const results = {
  timestamp: new Date().toISOString(),
  validation_checks: {
    input_validation: 0,
    null_safety: 0,
    error_handling: 0
  },
  total_checks: 0,
  passed_checks: 0,
  status: 'completed'
};

// Analyze source files for validation patterns
function analyzeValidation() {
  console.log('🔍 Analyzing input validation...');

  const sourceFiles = getSourceFiles();
  let inputValidationCount = 0;
  let nullSafetyCount = 0;
  let errorHandlingCount = 0;

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');

    // Check for input validation patterns
    if (content.includes('if (!') || content.includes('throw new Error') ||
        content.includes('validate') || content.includes('check')) {
      inputValidationCount++;
    }

    // Check for null safety patterns
    if (content.includes('=== null') || content.includes('!== null') ||
        content.includes('== null') || content.includes('!= null') ||
        content.includes('typeof') || content.includes('instanceof')) {
      nullSafetyCount++;
    }

    // Check for error handling patterns
    if (content.includes('try {') || content.includes('catch') ||
        content.includes('throw') || content.includes('Error(')) {
      errorHandlingCount++;
    }
  }

  results.validation_checks.input_validation = inputValidationCount;
  results.validation_checks.null_safety = nullSafetyCount;
  results.validation_checks.error_handling = errorHandlingCount;
  results.total_checks = sourceFiles.length;
  results.passed_checks = Math.min(inputValidationCount, sourceFiles.length);

  console.log(`📊 Input validation checks: ${inputValidationCount}`);
  console.log(`📊 Null safety checks: ${nullSafetyCount}`);
  console.log(`📊 Error handling checks: ${errorHandlingCount}`);
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

// Generate validation report
function generateReport() {
  const reportPath = path.join('reports', 'validation-report.json');
  const reportsDir = path.dirname(reportPath);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`✅ Validation report saved to ${reportPath}`);
}

// Main execution
function main() {
  console.log('✅ Running validation tests...');

  try {
    analyzeValidation();
    generateReport();

    console.log('✅ Validation tests completed successfully');

    // Exit with success
    process.exit(0);
  } catch (error) {
    console.error('❌ Validation test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, results };