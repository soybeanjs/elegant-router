import { splitRouterName, transformRouterNameToPath } from '@elegant-router/core';
import type { ElegantRouterNamePathEntry } from '@elegant-router/core';
import type { CustomRouteConfig, ElegantVueRouterOption } from '../types';

/**
 * get custom route config
 *
 * @param options
 */
export function getCustomRouteConfig(
  options: ElegantVueRouterOption,
  generatedEntries: ElegantRouterNamePathEntry[]
): CustomRouteConfig {
  const { map, names } = options.customRoutes;

  const entryMap = new Map<string, string>();
  const firstLevelRouteSet = new Set<string>();
  const lastLevelRouteSet = new Set<string>();

  Object.entries(map || {}).forEach(([name, rPath]) => {
    const routeName = options.routeNameTransformer(name.toLocaleLowerCase());
    const routePath = options.routePathTransformer(routeName, rPath);

    if (!entryMap.has(routeName)) {
      entryMap.set(routeName, routePath);
    }

    if (!firstLevelRouteSet.has(routeName)) {
      firstLevelRouteSet.add(routeName);
    }

    if (!lastLevelRouteSet.has(routeName)) {
      lastLevelRouteSet.add(routeName);
    }
  });

  names?.forEach(name => {
    const itemNames = splitRouterName(name);
    itemNames.forEach((itemName, index) => {
      const transformName = itemName.toLocaleLowerCase();
      const routeName = options.routeNameTransformer(transformName);
      const routePath = options.routePathTransformer(routeName, transformRouterNameToPath(transformName));

      if (!entryMap.has(routeName)) {
        entryMap.set(routeName, routePath);
      }

      if (index === 0) {
        if (!firstLevelRouteSet.has(routeName)) {
          firstLevelRouteSet.add(routeName);
        }
      }

      if (index === itemNames.length - 1) {
        if (!lastLevelRouteSet.has(routeName)) {
          lastLevelRouteSet.add(routeName);
        }
      }
    });
  });

  const generatedNameSet = new Set<string>(generatedEntries.map(([name]) => name));
  function isInGeneratedEntries(routeName: string) {
    return generatedNameSet.has(routeName);
  }

  const entries: ElegantRouterNamePathEntry[] = Array.from(entryMap.entries()).filter(
    ([name]) => !isInGeneratedEntries(name)
  );
  const firstLevelRoutes: string[] = Array.from(firstLevelRouteSet).filter(name => !isInGeneratedEntries(name));
  const lastLevelRoutes: string[] = Array.from(lastLevelRouteSet).filter(name => !isInGeneratedEntries(name));

  return {
    entries,
    firstLevelRoutes,
    lastLevelRoutes
  };
}
