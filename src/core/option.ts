import process from 'node:process';
import path from 'node:path';
import { getImportName, pascalCase, resolveAliasFromTsConfig, resolveImportPath } from '../shared';
import type { AutoRouterNode, AutoRouterOptions, ParsedAutoRouterOptions } from '../types';

export async function resolveOptions(options?: AutoRouterOptions): Promise<ParsedAutoRouterOptions> {
  const cwd = process.cwd();
  const alias = await resolveAliasFromTsConfig(cwd, 'tsconfig.json');

  const defaultCustomRoute = {
    Root: '/',
    NotFound: '/:pathMatch(.*)*'
  };

  const defaultOptions: Required<AutoRouterOptions> = {
    cwd,
    pageDir: ['src/pages', 'src/views'],
    pageInclude: '**/*.vue',
    pageExclude: ['**/components/**', '**/modules/**'],
    dts: 'src/typings/elegant-router.d.ts',
    vueRouterDts: 'src/typings/typed-router.d.ts',
    tsconfig: 'tsconfig.json',
    alias,
    routerGeneratedDir: 'src/router/_generated',
    customRoute: defaultCustomRoute,
    layouts: {
      base: 'src/layouts/base/index.vue'
    },
    layoutLazy: () => true,
    getRoutePath: node => node.path,
    getRouteName,
    getRouteLayout: _node => Object.keys(defaultOptions.layouts!)?.[0] || 'unknown',
    routeLazy: () => true
  };

  const { layouts, layoutLazy, ...restOptions } = Object.assign(defaultOptions, options);

  const parsedOptions: ParsedAutoRouterOptions = {
    ...restOptions,
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

  parsedOptions.customRoute = {
    ...defaultCustomRoute,
    ...restOptions.customRoute
  };

  return parsedOptions;
}

export function getRouteName(node: AutoRouterNode) {
  const $path = node.path.replaceAll(':', '').replaceAll('?', '');

  return pascalCase($path.split('/').join('-'));
}
