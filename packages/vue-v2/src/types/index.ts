import type { _RouteRecordBase } from 'vue-router';
import type { ElegantRouterOption } from '@elegant-router/core';

export interface ElegantVueRouterOption extends ElegantRouterOption {
  /**
   * the declaration file directory of the generated routes
   * @default 'src/typings/elegant-router.d.ts'
   */
  dtsDir: string;
  /**
   * the directory of the imports of routes
   * @default 'src/router/elegant/imports.ts'
   */
  importsDir: string;
  /**
   * whether the route is lazy import
   * @param routeName route name
   * @default _name => true
   * @example
   * - the direct import
   * ```ts
   * import Home from './views/home/index.vue';
   * ```
   * - the lazy import
   * ```ts
   * const Home = import('./views/home/index.vue');
   * ```
   */
  lazyImport(routeName: string): boolean;
  /**
   * the directory of the route const
   * @default 'src/router/elegant/routes.ts'
   */
  constDir: string;
  /**
   * define custom routes, which's route only generate the route declaration
   * @description the name path map of custom route
   * @default
   * ```ts
   *  const routesMap: Record<string, string> = {
   *    root: '/', // the root route
   *    notFound: '/:pathMatch(.*)*' // the 404 route
   * }
   * ```
   */
  customRoutesMap: Record<string, string>;
  /**
   * the name and file path of the route layouts
   * @default
   * ```ts
   * const layouts: Record<string, string> = {
   *   base: 'src/layouts/base-layout/index.vue',
   *   blank: 'src/layouts/blank-layout/index.vue'
   * }
   * ```
   */
  layouts: Record<string, string>;
  /**
   * the default layout name used in generated route const
   * @description if it doesn't set, it will be the first key of option "layouts"
   */
  defaultLayout: string;
  /**
   * whether the route is lazy import
   * @param layoutName the layout name
   * @default _name => false
   */
  layoutLazyImport(layoutName: string): boolean;
  /**
   * the directory of the routes transform function
   * @description Converts the route definitions of the generated conventions into routes for the vue-router.
   * @default 'src/router/elegant/transform.ts'
   */
  transformDir: string;
  /**
   * the route meta generator
   * @param routeName the route name
   * @default
   * ```ts
   *  const onRouteMetaGen = (routeName: string) => ({
   *    title: routeName
   *  })
   * ```
   */
  onRouteMetaGen(routeName: string): Record<string, unknown>;
  /**
   * the route const format command
   * @default 'eslint --fix src/router/elegant/routes.ts'
   * @description if the eslint command is not found, it will be use the builtin package "prettier" to format
   */
  routeConstFormatCommand: string;
  /**
   * the route const update override props
   * @description if override update one of meta props, for example, you can use "meta.title" to update the title
   */
  routeConstUpdateOverrideProps: string[];
}

/**
 * elegant vue route
 */
export type AutoRoute = Omit<_RouteRecordBase, 'name' | 'path' | 'children'> & {
  name: string;
  path: string;
  component?: string;
  children?: AutoRoute[];
};

export type RouteConstExport = {
  autoRoutes: AutoRoute[];
};
