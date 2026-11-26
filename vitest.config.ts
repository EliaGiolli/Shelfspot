import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environmentOptions: {
  jsdom: {
    url: 'http://localhost/',
  },
},
    pool: 'threads',
    fileParallelism: false,
    maxWorkers: 1,
  },
});