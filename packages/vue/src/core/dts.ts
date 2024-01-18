import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { PAGE_DEGREE_SPLITTER } from '@elegant-router/core';
import type { ElegantRouterFile, ElegantRouterNamePathEntry } from '@elegant-router/core';
import { ensureFile } from '../shared/fs';
import type { CustomRouteConfig, ElegantVueRouterOption } from '../types';
import { LAYOUT_PREFIX, VIEW_PREFIX } from '../constants';
import { getCustomRouteConfig } from './shared';
import { createPrefixCommentOfGenFile } from './comment';

export async function genDtsFile(
  files: ElegantRouterFile[],
  entries: ElegantRouterNamePathEntry[],
  options: ElegantVueRouterOption
) {
  if (files.length === 0) return;

  const customEntries = getCustomRouteConfig(options);

  const code = getDtsCode(files, entries, customEntries, options.layouts);

  const dtsPath = path.posix.join(options.cwd, options.dtsDir);

  try {
    await ensureFile(dtsPath);
  } catch {}

  await writeFile(dtsPath, code);
}

function getDtsCode(
  files: ElegantRouterFile[],
  entries: ElegantRouterNamePathEntry[],
  customRoute: CustomRouteConfig,
  layouts: Record<string, string>
) {
  const {
    entries: customEntries,
    firstLevelRoutes: customFirstLevelRoutes,
    lastLevelRoutes: customLastLevelRoutes
  } = customRoute;

  const allEntries = [...customEntries, ...entries];

  const firstLevelRoutes = entries
    .filter(([name]) => name.split(PAGE_DEGREE_SPLITTER).length === 1)
    .map(([name]) => name);

  const layoutKeys = Object.keys(layouts);

  const prefixComment = createPrefixCommentOfGenFile();

  let code = `${prefixComment}

declare module "@elegant-router/types" {
  type ElegantConstRoute = import('@elegant-router/vue').ElegantConstRoute;

  /**
   * route layout
   */
  export type RouteLayout = ${layoutKeys.map(key => `"${key}"`).join(' | ')};

  /**
   * route map
   */
  export type RouteMap = {`;
  allEntries.forEach(([routeName, routePath]) => {
    code += `\n    "${routeName}": "${routePath}";`;
  });

  code += `
  };

  /**
   * route key
   */
  export type RouteKey = keyof RouteMap;

  /**
   * route path
   */
  export type RoutePath = RouteMap[RouteKey];

  /**
   * custom route key
   */ 
  export type CustomRouteKey = Extract<
    RouteKey,`;

  customEntries.forEach(([routeName]) => {
    code += `\n    | "${routeName}"`;
  });

  code += `
  >;

  /**
   * the generated route key
   */ 
  export type GeneratedRouteKey = Exclude<RouteKey, CustomRouteKey>;

  /**
   * the first level route key, which contain the layout of the route
   */
  export type FirstLevelRouteKey = Extract<
    RouteKey,`;

  firstLevelRoutes.forEach(routeName => {
    code += `\n    | "${routeName}"`;
  });

  code += `
  >;

  /**
   * the custom first level route key
   */
  export type CustomFirstLevelRouteKey = Extract<
    CustomRouteKey,`;

  customFirstLevelRoutes.forEach(routeName => {
    code += `\n    | "${routeName}"`;
  });

  code += `
  >;

  /**
   * the last level route key, which has the page file
   */
  export type LastLevelRouteKey = Extract<
    RouteKey,`;

  files.forEach(file => {
    code += `\n    | "${file.routeName}"`;
  });

  code += `
  >;

  /**
   * the custom last level route key
   */
  export type CustomLastLevelRouteKey = Extract<
    CustomRouteKey,`;

  customLastLevelRoutes.forEach(routeName => {
    code += `\n    | "${routeName}"`;
  });

  code += `
  >;

  /**
   * the single level route key
   */
  export type SingleLevelRouteKey = FirstLevelRouteKey & LastLevelRouteKey;

  /**
   * the custom single level route key
   */
  export type CustomSingleLevelRouteKey = CustomFirstLevelRouteKey & CustomLastLevelRouteKey;

  /**
   * the first level route key, but not the single level
  */
  export type FirstLevelRouteNotSingleKey = Exclude<FirstLevelRouteKey, SingleLevelRouteKey>;

  /**
   * the custom first level route key, but not the single level
   */
  export type CustomFirstLevelRouteNotSingleKey = Exclude<CustomFirstLevelRouteKey, CustomSingleLevelRouteKey>;

  /**
   * the center level route key
   */
  export type CenterLevelRouteKey = Exclude<GeneratedRouteKey, FirstLevelRouteKey | LastLevelRouteKey>;

  /**
   * the custom center level route key
   */
  export type CustomCenterLevelRouteKey = Exclude<CustomRouteKey, CustomFirstLevelRouteKey | CustomLastLevelRouteKey>;

  /**
   * the center level route key
   */
  type GetChildRouteKey<K extends RouteKey, T extends RouteKey = RouteKey> = T extends \`\${K}_\${infer R}\`
    ? R extends \`\${string}_\${string}\`
      ? never
      : T
    : never;

  /**
   * the single level route
   */
  type SingleLevelRoute<K extends SingleLevelRouteKey = SingleLevelRouteKey> = K extends string
    ? Omit<ElegantConstRoute, 'children'> & {
        name: K;
        path: RouteMap[K];
        component: \`${LAYOUT_PREFIX}\${RouteLayout}$${VIEW_PREFIX}\${K}\`;
      }
    : never;

  /**
   * the last level route
   */
  type LastLevelRoute<K extends GeneratedRouteKey> = K extends LastLevelRouteKey
    ? Omit<ElegantConstRoute, 'children'> & {
        name: K;
        path: RouteMap[K];
        component: \`${VIEW_PREFIX}\${K}\`;
      }
    : never;
  
  /**
   * the center level route
   */
  type CenterLevelRoute<K extends GeneratedRouteKey> = K extends CenterLevelRouteKey
    ? Omit<ElegantConstRoute, 'component'> & {
        name: K;
        path: RouteMap[K];
        children: (CenterLevelRoute<GetChildRouteKey<K>> | LastLevelRoute<GetChildRouteKey<K>>)[];
      }
    : never;

  /**
   * the multi level route
   */
  type MultiLevelRoute<K extends FirstLevelRouteNotSingleKey = FirstLevelRouteNotSingleKey> = K extends string
    ? ElegantConstRoute & {
        name: K;
        path: RouteMap[K];
        component: \`${LAYOUT_PREFIX}\${RouteLayout}\`;
        children: (CenterLevelRoute<GetChildRouteKey<K>> | LastLevelRoute<GetChildRouteKey<K>>)[];
      }
    : never;
  
  /**
   * the custom first level route
   */
  type CustomSingleLevelRoute<K extends CustomFirstLevelRouteKey = CustomFirstLevelRouteKey> = K extends string
    ? Omit<ElegantConstRoute, 'children'> & {
        name: K;
        path: RouteMap[K];
        component?: \`${LAYOUT_PREFIX}\${RouteLayout}$${VIEW_PREFIX}\${LastLevelRouteKey}\`;
      }
    : never;

  /**
   * the custom last level route
   */
  type CustomLastLevelRoute<K extends CustomRouteKey> = K extends CustomLastLevelRouteKey
    ? Omit<ElegantConstRoute, 'children'> & {
        name: K;
        path: RouteMap[K];
        component?: \`${VIEW_PREFIX}\${LastLevelRouteKey}\`;
      }
    : never;

  /**
   * the custom center level route
   */
  type CustomCenterLevelRoute<K extends CustomRouteKey> = K extends CustomCenterLevelRouteKey
    ? Omit<ElegantConstRoute, 'component'> & {
        name: K;
        path: RouteMap[K];
        children: (CustomCenterLevelRoute<GetChildRouteKey<K>> | CustomLastLevelRoute<GetChildRouteKey<K>>)[];
      }
    : never;

  /**
   * the custom multi level route
   */
  type CustomMultiLevelRoute<K extends CustomFirstLevelRouteNotSingleKey = CustomFirstLevelRouteNotSingleKey> =
    K extends string
      ? ElegantConstRoute & {
          name: K;
          path: RouteMap[K];
          component: \`${LAYOUT_PREFIX}\${RouteLayout}\`;
          children: (CustomCenterLevelRoute<GetChildRouteKey<K>> | CustomLastLevelRoute<K>)[];
        }
      : never;

  /**
   * the custom route
   */
  type CustomRoute = CustomSingleLevelRoute | CustomMultiLevelRoute;

  /**
   * the generated route
   */
  type GeneratedRoute = SingleLevelRoute | MultiLevelRoute;

  /**
   * the elegant route
   */
  type ElegantRoute = GeneratedRoute | CustomRoute;
}
`;

  return code;
}
