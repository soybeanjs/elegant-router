import process from 'node:process';
import { pascalCase } from '../shared';
import type { AutoRouterOptions, RequiredAutoRouterOptions } from '../types';

export function resolveOptions(options: AutoRouterOptions): RequiredAutoRouterOptions {
  const defaultOptions: RequiredAutoRouterOptions = {
    cwd: process.cwd(),
    pageDir: 'src/pages',
    pageInclude: '**/*.vue',
    pageExclude: ['**/components/**', '**/modules/**'],
    dts: 'src/typings/auto-router.d.ts',
    tsconfig: 'tsconfig.json',
    routerDir: 'src/router/auto-router',
    layouts: {
      base: 'src/layouts/base/index.vue'
    },
    layoutLazy: () => false,
    getRoutePath: node => node.path,
    getRouteName: node => pascalCase(node.path.split('/').join('-')),
    getRouteLayout: (_node, layouts) => Object.keys(layouts)[0],
    routeLazy: () => true
  };

  const resolvedOptions: RequiredAutoRouterOptions = Object.assign(defaultOptions, options);

  return resolvedOptions;
}
