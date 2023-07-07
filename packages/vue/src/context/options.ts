import type { ElegantRouterOption } from '@elegant-router/core';
import type { ElegantVueRouterOption } from '../types';

/**
 * create the plugin options
 * @param options the plugin options
 */
export function createPluginOptions(erOptions: ElegantRouterOption, options?: Partial<ElegantVueRouterOption>) {
  const DTS_DIR = 'src/typings/elegant-router.d.ts';
  const IMPORT_DIR = 'src/router/auto-imports.ts';
  const CONST_DIR = 'src/router/auto-routes.ts';
  const MODULE_DIR = 'src/router/modules';

  const opts: ElegantVueRouterOption = {
    dtsDir: DTS_DIR,
    importsDir: IMPORT_DIR,
    lazyImport: _name => true,
    constDir: CONST_DIR,
    splitModule: true,
    moduleDir: MODULE_DIR,
    customConstRoutes: [],
    ...erOptions,
    ...options
  };

  return opts;
}
