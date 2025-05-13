import { join } from 'node:path';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import type { AutoRouterOptions } from '../src/types';

export async function createTestFiles(options: AutoRouterOptions) {
  const { pageDir: pageDirs, layouts } = options;

  if (!pageDirs?.length) return;

  const pageDir = pageDirs[0];

  // Create page directory
  await mkdir(pageDir, { recursive: true });

  // Create layout directories and files
  if (layouts) {
    for await (const path of Object.values(layouts)) {
      const layoutDir = path.split('/').slice(0, -1).join('/');
      await mkdir(layoutDir, { recursive: true });
      await writeFile(path, `<template><slot /></template>`);
    }
  }

  // Create test page files
  const testPages = ['home/index.vue', 'about/index.vue', 'user/profile.vue'];

  for await (const page of testPages) {
    const pagePath = join(pageDir, page);
    const pageDirPath = pagePath.split('/').slice(0, -1).join('/');
    await mkdir(pageDirPath, { recursive: true });
    await writeFile(pagePath, `<template><div>${page}</div></template>`);
  }
}

export async function cleanupTestFiles(options: AutoRouterOptions) {
  const { pageDir: pageDirs, layouts } = options;

  // Remove page directory
  if (!pageDirs?.length) return;

  const pageDir = pageDirs[0];

  await rm(pageDir, { recursive: true, force: true });

  // Remove layout directories
  if (layouts) {
    for await (const path of Object.values(layouts)) {
      const layoutDir = path.split('/').slice(0, -1).join('/');
      await rm(layoutDir, { recursive: true, force: true });
    }
  }
}
