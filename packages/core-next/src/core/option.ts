import process from 'node:process';
import { pascalCase, resolveAliasFromTsConfig } from '../shared';
import type { AutoRouterNode, AutoRouterOptions, RequiredAutoRouterOptions } from '../types';

export async function resolveOptions(options?: AutoRouterOptions): Promise<RequiredAutoRouterOptions> {
  const cwd = process.cwd();
  const alias = await resolveAliasFromTsConfig(cwd, 'tsconfig.json');

  const defaultOptions: RequiredAutoRouterOptions = {
    cwd,
    pageDir: ['src/pages', 'src/views'],
    pageInclude: '**/*.vue',
    pageExclude: ['**/components/**', '**/modules/**'],
    dts: 'src/typings/auto-router.d.ts',
    tsconfig: 'tsconfig.json',
    alias,
    routerDir: 'src/router/auto-router',
    layouts: {
      base: 'src/layouts/base/index.vue'
    },
    layoutLazy: () => false,
    getRoutePath: node => node.path,
    getRouteName,
    getRouteLayout: (_node, layouts) => Object.keys(layouts)[0],
    routeLazy: () => true
  };

  const resolvedOptions: RequiredAutoRouterOptions = Object.assign(defaultOptions, options);

  return resolvedOptions;
}

export function getRouteName(node: AutoRouterNode) {
  const path = node.path.replaceAll(':', '').replaceAll('?', '');

  return pascalCase(path.split('/').join('-'));
}
