import { beforeEach, describe, expect, it } from 'vitest';
import { AutoRouter } from '../../src/core';
import type { AutoRouterOptions } from '../../src/types';

describe('AutoRouter', () => {
  let options: AutoRouterOptions;
  let autoRouter: AutoRouter;

  beforeEach(() => {
    options = {
      pageDir: 'src/views',
      layouts: {
        base: 'src/layouts/base/index.vue',
        blank: 'src/layouts/blank/index.vue'
      }
    };
    autoRouter = new AutoRouter(options);
  });

  it('should initialize with default options', () => {
    const resolvedOptions = autoRouter.getOptions();
    expect(resolvedOptions.pageDir).toBe('src/views');
    expect(resolvedOptions.layouts).toEqual([
      {
        importName: 'BaseLayout',
        importPath: '@/layouts/base/index.vue',
        isLazy: true,
        name: 'base'
      },
      {
        importName: 'BlankLayout',
        importPath: '@/layouts/blank/index.vue',
        isLazy: true,
        name: 'blank'
      }
    ]);
  });

  it('should handle custom routes configuration', () => {
    const customOptions: AutoRouterOptions = {
      ...options,
      customRoutes: ['/dashboard', '/user/profile']
    };
    const customRouter = new AutoRouter(customOptions);
    const resolvedOptions = customRouter.getOptions();
    expect(resolvedOptions.customRoutes).toEqual(['/dashboard', '/user/profile']);
  });

  it('should handle root redirect configuration', () => {
    const redirectOptions: AutoRouterOptions = {
      ...options,
      rootRedirect: '/dashboard'
    };
    const redirectRouter = new AutoRouter(redirectOptions);
    const resolvedOptions = redirectRouter.getOptions();
    expect(resolvedOptions.rootRedirect).toBe('/dashboard');
  });
});
