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
    pageInclude: '**/*.vue',
    pageExclude: ['**/components/**', '**/modules/**'],
    dts: 'src/typings/elegant-router.d.ts',
    vueRouterDts: 'src/typings/typed-router.d.ts',
    tsconfig: 'tsconfig.json',
    alias,
    routerGeneratedDir: 'src/router/_generated',
    customRoutes: [],
    rootRedirect: '/home',
    notFoundRouteComponent: '404',
    defaultCustomRouteComponent: 'Wip',
    layouts: {
      base: 'src/layouts/base/index.vue',
      blank: 'src/layouts/blank/index.vue'
    },
    layoutLazy: () => true,
    getRoutePath: node => node.path,
    getRouteName: node => transformPathToName(node.path),
    routeLayoutMap: {},
    getRouteLayout: node => {
      const layout = defaultOptions.routeLayoutMap[node.filePath];

      if (!layout) {
        return Object.keys(defaultOptions.layouts!)?.[0] || 'unknown';
      }

      return layout;
    },
    routeLazy: () => true,
    getRouteMeta: () => null
  };

  const { layouts, layoutLazy, ...restOptions } = Object.assign(defaultOptions, options);

  const pageInclude = Array.isArray(restOptions.pageInclude) ? restOptions.pageInclude : [restOptions.pageInclude];

  restOptions.cwd = normalizePath(restOptions.cwd);
  restOptions.defaultCustomRouteComponent = pascalCase(restOptions.defaultCustomRouteComponent);

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
