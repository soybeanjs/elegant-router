import process from 'node:process';
import path from 'node:path';
import { getImportName, resolveAliasFromTsConfig, resolveImportPath, transformPathToName } from '../shared';
import { NOT_FOUND_ROUTE_NAME, ROOT_ROUTE_NAME } from '../constants';
import type { AutoRouterOptions, CustomRoute, ParsedAutoRouterOptions } from '../types';

export function resolveOptions(options?: AutoRouterOptions): ParsedAutoRouterOptions {
  const cwd = process.cwd();
  const alias = resolveAliasFromTsConfig(cwd, 'tsconfig.json');

  const defaultOptions: Required<AutoRouterOptions> = {
    cwd,
    watchFile: true,
    fileUpdateDuration: 500,
    pageDir: 'src/views',
    pageInclude: '**/*.vue',
    pageExclude: ['**/components/**', '**/modules/**'],
    dts: 'src/typings/elegant-router.d.ts',
    vueRouterDts: 'src/typings/typed-router.d.ts',
    tsconfig: 'tsconfig.json',
    alias,
    routerGeneratedDir: 'src/router/_generated',
    customRoute: {},
    rootRedirect: '/home',
    notFoundRouteComponent: '404',
    defaultCustomRouteComponent: 'wip',
    layouts: {
      base: 'src/layouts/base/index.vue',
      blank: 'src/layouts/blank/index.vue'
    },
    layoutLazy: () => true,
    getRoutePath: node => node.path,
    getRouteName: node => transformPathToName(node.path),
    routeLayoutMap: {},
    getRouteLayout: (node, layoutMap) => {
      const layout = layoutMap[node.filePath];

      if (!layout) {
        return Object.keys(defaultOptions.layouts!)?.[0] || 'unknown';
      }

      return layout;
    },
    routeLazy: () => true
  };

  const { customRoute, layouts, layoutLazy, ...restOptions } = Object.assign(defaultOptions, options);

  const builtInCustomRoute: CustomRoute = {
    [ROOT_ROUTE_NAME]: '/',
    [NOT_FOUND_ROUTE_NAME]: '/:pathMatch(.*)*'
  };

  const pageInclude = Array.isArray(restOptions.pageInclude) ? restOptions.pageInclude : [restOptions.pageInclude];

  const parsedOptions: ParsedAutoRouterOptions = {
    pageExtension: pageInclude.map(item => item.split('.').pop()!),
    ...restOptions,
    customRoute: {
      ...customRoute,
      ...builtInCustomRoute
    },
    layouts: Object.entries(layouts).map(([name, importPath]) => {
      let importName = getImportName(name);

      if (!importName.endsWith('Layout')) {
        importName = `${importName}Layout`;
      }

      return {
        name,
        importPath: resolveImportPath(path.join(cwd, importPath), restOptions.alias),
        importName,
        isLazy: layoutLazy(name)
      };
    })
  };

  return parsedOptions;
}
