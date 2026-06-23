module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.e2e-spec.[jt]s'],
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.e2e.json' }],
  },
};
