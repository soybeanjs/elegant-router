import type { ElegentRouterOption } from '@elegent-router/core';
import type { ElegentVueRouterOption } from '../types';

/**
 * create the plugin options
 * @param options the plugin options
 */
export function createPluginOptions(erOptions: ElegentRouterOption, options?: Partial<ElegentVueRouterOption>) {
  const DTS_DIR = 'src/typings/elegent-router.d.ts';
  const IMPORT_DIR = 'src/router/auto-imports.ts';
  const CONST_DIR = 'src/router/auto-routes.ts';
  const MODULE_DIR = 'src/router/modules';

  const opts: ElegentVueRouterOption = {
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
