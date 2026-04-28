/**
 * Console Error Middleware for Playwright Tests
 * Captures and reports console errors during test execution
 * Filters known external errors (komoot, analytics, etc.)
 */

const EXTERNAL_ERROR_PATTERNS = [
  // Map/analytics external scripts
  'komoot.com',
  'google-analytics.com',
  'googletagmanager',
  'facebook.net',
  'doubleclick.net',
  'googleadservices',

  // React hydration (external)
  'Minified React error',
  'react-hydrateRoot',

  // Firebase Firestore (network/offline - not app errors)
  '@firebase/firestore:',
  'Cloud Firestore backend',
  'client is offline',
  'Could not reach',

  // Firebase Auth (expected when testing invalid credentials)
  '@firebase/auth:',
  'Firebase: Error',
  'auth/invalid-credential',
  'auth/wrong-password',

  // Network/HTTP errors (external requests)
  'Failed to fetch',
  'Failed to load resource',
  'server responded with a status',
  'net::ERR_',
  'NetworkError',
  'Fetch failed',
  'HTTP error',
  'status of 400',
  'status of 404',
  'status of 500',
  'status of 403',
];

/**
 * Check if error is from external source (should be ignored)
 * @param {string} errorText - Error message to check
 * @returns {boolean} - True if external error
 */
function isExternalError(errorText) {
  return EXTERNAL_ERROR_PATTERNS.some(pattern => 
    errorText.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Filter out external errors from array
 * @param {string[]} errors - Array of error messages
 * @returns {string[]} - Filtered errors (external removed)
 */
function filterExternalErrors(errors) {
  return errors.filter(e => !isExternalError(e));
}

/**
 * Create a console error handler for a test
 * @param {object} page - Playwright page object
 * @returns {{errors: string[], warnings: string[], capture: Function, check: Function, filterErrors: Function}}
 */
function createConsoleHandler(page) {
  const errors = [];
  const warnings = [];

  const capture = () => {
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        errors.push(text);
      } else if (msg.type() === 'warning') {
        warnings.push(text);
      }
    });

    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });
  };

  const check = (shouldFail = true) => {
    const appErrors = filterExternalErrors(errors);
    const result = {
      errors: errors.length,
      appErrors: appErrors.length,
      externalErrors: errors.length - appErrors.length,
      warnings: warnings.length,
      hasErrors: errors.length > 0,
      hasAppErrors: appErrors.length > 0
    };

    if (shouldFail && result.hasAppErrors) {
      console.log('\n=== App Console Errors (excluding external) ===');
      appErrors.forEach(e => console.log(`  ERROR: ${e.substring(0, 150)}`));
    }

    if (result.externalErrors > 0) {
      console.log(`\n(excluded ${result.externalErrors} external errors)`);
    }

    if (result.hasWarnings) {
      console.log('\n=== Console Warnings ===');
      warnings.forEach(w => console.log(`  WARN: ${w}`));
    }

    return result;
  };

  const filterErrors = () => filterExternalErrors(errors);

  const clear = () => {
    errors.length = 0;
    warnings.length = 0;
  };

  return { errors, warnings, capture, check, filterErrors, clear, isExternalError };
}

/**
 * Setup console error capturing for a test
 * Call this at the beginning of each test
 * @param {object} page - Playwright page object
 * @param {boolean} failOnError - Whether to fail the test on console errors
 * @returns {Promise<{errors: string[], check: Function, clear: Function, isExternalError: Function}>}
 */
async function setupConsoleCapture(page) {
  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
    }
  });

  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });

  const check = (shouldFail = true) => {
    const appErrors = filterExternalErrors(errors);
    const result = {
      errors: errors,
      appErrors: appErrors,
      errorCount: errors.length,
      appErrorCount: appErrors.length,
      externalErrorCount: errors.length - appErrors.length,
      warnings: warnings,
      warningCount: warnings.length
    };

    if (shouldFail && result.appErrorCount > 0) {
      console.log('\n=== App Console Errors ===');
      appErrors.forEach(e => console.log(`  - ${e.substring(0, 150)}`));
    }

    if (result.externalErrorCount > 0) {
      console.log(`(filtered ${result.externalErrorCount} external errors)`);
    }

    return result;
  };

  const clear = () => {
    errors.length = 0;
    warnings.length = 0;
  };

  return { errors, check, clear, isExternalError };
}

/**
 * Wrap a test function with console error checking
 * @param {Function} testFn - Test function to wrap
 * @param {boolean} failOnError - Whether to fail on console errors
 * @returns {Function} - Wrapped test function
 */
function withConsoleCheck(testFn) {
  return async (args) => {
    const { page } = args;
    const { check } = await setupConsoleCapture(page);

    let testError = null;
    let consoleErrors = 0;
    try {
      await testFn(args);
    } catch (e) {
      testError = e;
    }
    const result = check();
    consoleErrors = result.appErrorCount;

    if (consoleErrors > 0) {
      const err = new Error('Test failed due to ' + consoleErrors + ' console error(s)');
      if (testError) {
        testError.message += ' (plus ' + consoleErrors + ' console errors)';
        throw testError;
      }
      throw err;
    }
    if (testError) {
      throw testError;
    }
  };
}

module.exports = {
  createConsoleHandler,
  setupConsoleCapture,
  withConsoleCheck,
  isExternalError,
  filterExternalErrors,
  EXTERNAL_ERROR_PATTERNS
};