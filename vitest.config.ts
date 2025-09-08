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
      enabled: true,
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      provider: 'v8',
      exclude: [
        'src/**/types.ts',
        'src/**/index.ts',
        'src/**/__tests__/**',
        'src/**/*.d.ts'
      ],
      thresholds: {
        lines: 65,
        functions: 65,
        statements: 65,
        branches: 55
      }
    },
    // Run tests in isolated environments
    isolate: true,
    // Enable global test functions
    globals: true
  }
});
