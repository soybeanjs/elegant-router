import { afterAll, beforeAll } from 'vitest';
import type { AutoRouterOptions } from '../src/types';
import { cleanupTestFiles, createTestFiles } from './shared';

export const testOptions: AutoRouterOptions = {
  pageDir: 'test/views',
  layouts: {
    base: 'test/layouts/base/index.vue',
    blank: 'test/layouts/blank/index.vue'
  }
};

beforeAll(async () => {
  await createTestFiles(testOptions);
});

afterAll(async () => {
  await cleanupTestFiles(testOptions);
});
