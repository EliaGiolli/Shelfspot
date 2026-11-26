import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // the jsdom environment allows us to test the browser APIs 
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    pool: 'threads',
    fileParallelism: false,
    maxWorkers: 1,
  },
});