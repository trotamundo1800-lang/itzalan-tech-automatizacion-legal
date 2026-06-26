module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.e2e-spec.[jt]s'],
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.e2e.json' }],
  },
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testTimeout: 30000,
};
