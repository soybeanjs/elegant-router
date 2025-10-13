import process from 'node:process';
import path from 'node:path';
import { normalizePath } from 'unplugin-utils';
import { getImportName, pascalCase, resolveAliasFromTsConfig, resolveImportPath, transformPathToName } from '../shared';
import type { AutoRouterOptions, ParsedAutoRouterOptions } from '../types';

export function resolveOptions(options?: AutoRouterOptions): ParsedAutoRouterOptions {
  const cwd = process.cwd();
  const alias = resolveAliasFromTsConfig(cwd, 'tsconfig.json');

  const defaultOptions: Required<AutoRouterOptions> = {
    cwd,
    watchFile: true,
    fileUpdateDuration: 500,
    pageDir: 'src/views',
    pageInclude: ['**/*.vue', '**/*.tsx', '**/*.jsx'],
    pageExclude: ['**/components/**', '**/modules/**'],
    dts: 'src/typings/elegant-router.d.ts',
    vueRouterDts: 'src/typings/typed-router.d.ts',
    tsconfig: 'tsconfig.json',
    alias,
    routerGeneratedDir: 'src/router/_generated',
    generateBuiltinRoutes: false,
    reuseRoutes: [],
    defaultReuseRouteComponent: 'Wip',
    rootRedirect: '/home',
    notFoundRouteComponent: '404',
    layouts: {
      base: 'src/layouts/base/index.vue',
      blank: 'src/layouts/blank/index.vue'
    },
    layoutLazy: () => true,
    getRoutePath: node => node.path,
    getRouteName: node => transformPathToName(node.path),
    getRouteLayout: () => Object.keys(defaultOptions.layouts)[0],
    routeLazy: () => true,
    getRouteMeta: () => null
  };

  const { layouts, layoutLazy, ...restOptions } = Object.assign(defaultOptions, options);

  const pageInclude = Array.isArray(restOptions.pageInclude) ? restOptions.pageInclude : [restOptions.pageInclude];

  restOptions.cwd = normalizePath(restOptions.cwd);
  restOptions.defaultReuseRouteComponent = pascalCase(restOptions.defaultReuseRouteComponent);
  restOptions.notFoundRouteComponent = pascalCase(restOptions.notFoundRouteComponent);

  if (Object.keys(layouts).length === 0) {
    throw new Error('layouts is required');
  }

  restOptions.getRouteLayout = () => Object.keys(layouts)[0];

  const parsedOptions: ParsedAutoRouterOptions = {
    pageExtension: pageInclude.map(item => item.split('.').pop()!),
    ...restOptions,
    layouts: Object.entries(layouts).map(([name, importPath]) => {
      let importName = getImportName(name);

      if (!importName.endsWith('Layout')) {
        importName = `${importName}Layout`;
      }

      const iPath = path.resolve(cwd, importPath);
      const $importPath = normalizePath(resolveImportPath(iPath, restOptions.alias));

      return {
        name,
        importPath: $importPath,
        importName,
        isLazy: layoutLazy(name)
      };
    })
  };

  return parsedOptions;
}
