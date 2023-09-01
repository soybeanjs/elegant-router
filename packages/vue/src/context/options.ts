import type { ElegantRouterOption } from '@elegant-router/core';
import type { ElegantVueRouterOption } from '../types';

/**
 * create the plugin options
 * @param options the plugin options
 */
export function createPluginOptions(erOptions: ElegantRouterOption, options?: Partial<ElegantVueRouterOption>) {
  const DTS_DIR = 'src/typings/elegant-router.d.ts';
  const IMPORT_DIR = 'src/router/elegant/imports.ts';
  const CONST_DIR = 'src/router/elegant/routes.ts';
  const CUSTOM_ROUTES_MAP = {
    root: '/',
    'not-found': '/:pathMatch(.*)*'
  };
  const DEFAULT_LAYOUTS: Record<string, string> = {
    base: 'src/layouts/base-layout/index.vue'
  };

  const opts: ElegantVueRouterOption = {
    dtsDir: DTS_DIR,
    importsDir: IMPORT_DIR,
    lazyImport: _name => true,
    constDir: CONST_DIR,
    customRoutesMap: CUSTOM_ROUTES_MAP,
    layouts: DEFAULT_LAYOUTS,
    defaultLayout: Object.keys(DEFAULT_LAYOUTS)[0],
    layoutLazyImport: _name => true,
    transformDir: 'src/router/elegant/transform.ts',
    onRouteMetaGen: name => ({
      title: name
    }),
    ...erOptions,
    ...options
  };

  opts.defaultLayout = Object.keys(opts.layouts)[0];

  return opts;
}
