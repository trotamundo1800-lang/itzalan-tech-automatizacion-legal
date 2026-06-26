import 'dotenv/config';

// Suppress specific warnings that don't affect tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('experimental') ||
        args[0].includes('Warning:') ||
        args[0].includes('DeprecationWarning'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Give the app plenty of time to initialize
jest.setTimeout(30000);
