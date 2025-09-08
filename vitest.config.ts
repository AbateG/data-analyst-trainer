import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@engine': path.resolve(__dirname, 'src/engine')
    }
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Enable parallel test execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        useAtomics: true
      }
    },
    // Enable test caching
    cache: {
      dir: './node_modules/.vitest'
    },
    // Optimize test execution
    testTimeout: 30000,
    coverage: {
      enabled: false
    },
    // Run tests in isolated environments
    isolate: true,
    // Enable global test functions
    globals: true
  }
});
