import { splitRouterName, transformRouterNameToPath } from '@elegant-router/core';
import type { ElegantRouterNamePathEntry } from '@elegant-router/core';
import type { ElegantVueRouterOption, CustomRouteConfig } from '../types';

/**
 * get custom route config
 * @param options
 */
export function getCustomRouteConfig(options: ElegantVueRouterOption): CustomRouteConfig {
  const { map, names } = options.customRoutes;

  const entries: ElegantRouterNamePathEntry[] = [];

  const firstLevelRoutes: string[] = [];
  const lastLevelRoutes: string[] = [];

  Object.entries(map).forEach(([name, rPath]) => {
    const routeName = options.routeNameTransformer(name.toLocaleLowerCase());
    const routePath = options.routePathTransformer(routeName, rPath);

    entries.push([routeName, routePath]);
    firstLevelRoutes.push(routeName);
    lastLevelRoutes.push(routeName);
  });

  names.forEach(name => {
    const itemNames = splitRouterName(name);
    itemNames.forEach((itemName, index) => {
      const transformName = itemName.toLocaleLowerCase();
      const routeName = options.routeNameTransformer(transformName);
      const routePath = options.routePathTransformer(routeName, transformRouterNameToPath(transformName));

      entries.push([routeName, routePath]);
      if (index === 0) {
        firstLevelRoutes.push(routeName);
      }

      if (index === itemNames.length - 1) {
        lastLevelRoutes.push(routeName);
      }
    });
  });

  return {
    entries,
    firstLevelRoutes,
    lastLevelRoutes
  };
}
