module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['app.js', 'index.html'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
};
