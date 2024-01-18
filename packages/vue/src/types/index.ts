import type { _RouteRecordBase } from 'vue-router';
import type { ElegantRouterNamePathEntry, ElegantRouterOption } from '@elegant-router/core';

export interface ElegantVueRouterOption extends ElegantRouterOption {
  /**
   * the declaration file directory of the generated routes
   *
   * @default 'src/typings/elegant-router.d.ts'
   */
  dtsDir: string;
  /**
   * the directory of the imports of routes
   *
   * @default 'src/router/elegant/imports.ts'
   */
  importsDir: string;
  /**
   * whether the route is lazy import
   *
   * @example
   *   - the direct import
   *   ```ts
   *   import Home from './views/home/index.vue';
   *   ```
   *   - the lazy import
   *   ```ts
   *   const Home = import('./views/home/index.vue');
   *   ```
   *
   * @default _name => true
   * @param routeName route name
   */
  lazyImport(routeName: string): boolean;
  /**
   * the directory of the route const
   *
   * @default 'src/router/elegant/routes.ts'
   */
  constDir: string;
  /**
   * define custom routes, which's route only generate the route declaration
   *
   * the name path map of custom route or the names, if only provide the names, it will generate path by the route name
   *
   * @example
   *   ```ts
   *   const customRoutes = {
   *   map: {},
   *   names: ['custom_multi_first']
   *   }
   *   ```
   *   the route name "custom_multi_first" will generate the following route map
   *   ```ts
   *   const routeMap = {
   *   custom: '/custom',
   *   custom_multi: '/custom/multi',
   *   custom_multi_first: '/custom/multi/first',
   *   }
   *   ```
   *
   * @default
   * ```ts
   * const customRoutes = {
   *   map: {
   *     root: '/', // the root route
   *     notFound: '/:pathMatch(.*)*' // the 404 route
   *   },
   *   names: []
   * }
   * ```
   */
  customRoutes: {
    map: Record<string, string>;
    names: string[];
  };
  /**
   * the name and file path of the route layouts
   *
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
   *
   * if it doesn't set, it will be the first key of option "layouts"
   */
  defaultLayout: string;
  /**
   * whether the route is lazy import
   *
   * @default _name => false
   * @param layoutName the layout name
   */
  layoutLazyImport(layoutName: string): boolean;
  /**
   * the directory of the routes transform function
   *
   * Converts the route definitions of the generated conventions into routes for the vue-router.
   *
   * @default 'src/router/elegant/transform.ts'
   */
  transformDir: string;
  /**
   * the route meta generator
   *
   * @default
   * ```ts
   *  const onRouteMetaGen = (routeName: string) => ({
   *    title: routeName
   *  })
   * ```
   * @param routeName the route name
   */
  onRouteMetaGen(routeName: string): Record<string, unknown>;
}

export type CustomRouteConfig = {
  entries: ElegantRouterNamePathEntry[];
  firstLevelRoutes: string[];
  lastLevelRoutes: string[];
};

/** elegant const route */
export type ElegantConstRoute = Omit<_RouteRecordBase, 'name' | 'path' | 'children'> & {
  name: string;
  path: string;
  component?: string;
  children?: ElegantConstRoute[];
};

export type RouteConstExport = {
  generatedRoutes: ElegantConstRoute[];
};
