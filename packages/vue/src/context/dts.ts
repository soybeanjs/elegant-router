import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { PAGE_DEGREE_SPLITTER } from '@elegant-router/core';
import type { ElegantRouterFile, ElegantRouterNamePathEntry } from '@elegant-router/core';
import { ensureFile } from '../shared/fs';
import type { ElegantVueRouterOption } from '../types';
import { createPrefixCommentOfGenFile } from './comment';
import { LAYOUT_PREFIX, VIEW_PREFIX } from '../constants';

function getDtsCode(
  files: ElegantRouterFile[],
  entries: ElegantRouterNamePathEntry[],
  customEntries: ElegantRouterNamePathEntry[],
  layouts: Record<string, string>
) {
  const allEntries = [...customEntries, ...entries];

  const firstLevelEntries = entries
    .filter(([name]) => name.split(PAGE_DEGREE_SPLITTER).length === 1)
    .map(([name]) => name);

  const layoutKeys = Object.keys(layouts);

  const prefixComment = createPrefixCommentOfGenFile();

  let code = `${prefixComment}

declare module "@elegant-router/types" {
  type RouteRecordRaw = import("vue-router").RouteRecordRaw;

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
   * the auto generated route key
   */ 
  export type AutoRouteKey = Exclude<RouteKey, CustomRouteKey>;

  /**
   * the first level route key, which contain the layout of the route
   */
  export type FirstLevelRouteKey = Extract<
    RouteKey,`;

  firstLevelEntries.forEach(routeName => {
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
   * the last level route key as child
   */
  export type LastLevelChildRouteKey = Exclude<LastLevelRouteKey, FirstLevelRouteKey>;

  /**
   * the single level route key
   */
  export type SingleLevelRouteKey = FirstLevelRouteKey & LastLevelRouteKey;

  /**
   * the first level route key, but not the single level
   */
  export type FirstLevelRouteNotSingleKey = Exclude<FirstLevelRouteKey, SingleLevelRouteKey>;

  /**
   * the center level route key
   */
  export type CenterLevelRouteKey = Exclude<AutoRouteKey, FirstLevelRouteKey | LastLevelRouteKey>;

  /**
   * the center level route key
   */
  type GetChildRouteKey<K extends AutoRouteKey, T extends AutoRouteKey = AutoRouteKey> = T extends \`\${K}\${infer R}\` ? (R extends '' ? never : T) : never;

  /**
   * the child of single level route
   */
  type SingleLevelRouteChild<K extends string, N = K> = Omit<RouteRecordRaw, 'component' | 'children'> & {
    name: N;
    path: '';
    component: \`${VIEW_PREFIX}\${K}\`;
  };
  
  /**
   * the single level route
   */
  type SingleLevelRoute<K extends SingleLevelRouteKey = SingleLevelRouteKey> = K extends string
    ? Omit<RouteRecordRaw, 'name' | 'path' | 'component' | 'children'> & {
        path: RouteMap[K];
        component: \`${LAYOUT_PREFIX}\${RouteLayout}\`;
        children: [SingleLevelRouteChild<K>];
      }
    : never;
  
  /**
   * the center level route
   */
  type CenterLevelRoute<K extends CenterLevelRouteKey> = K extends string
    ? Omit<RouteRecordRaw, 'name' | 'path' | 'component' | 'children' | 'redirect'> & {
        name: K;
        path: RouteMap[K];
        redirect: {
          name: GetChildRouteKey<K>;
        };
      }
    : never;
  
  /**
   * the last level route
   */
  type LastLevelRoute<K extends LastLevelRouteKey> = K extends string
    ? Omit<RouteRecordRaw, 'name' | 'path' | 'component' | 'children'> & {
        name: K;
        path: RouteMap[K];
        component: \`${VIEW_PREFIX}\${K}\`;
      }
    : never;
  
  /**
   * the multi level route
   */
  type MultiLevelRoute<K extends FirstLevelRouteNotSingleKey = FirstLevelRouteNotSingleKey> = K extends string
    ? Omit<RouteRecordRaw, 'name' | 'path' | 'component' | 'children' | 'redirect'> & {
        name: K;
        path: RouteMap[K];
        component: \`${LAYOUT_PREFIX}\${RouteLayout}\`;
        redirect: {
          name: GetChildRouteKey<K>;
        };
        children: (CenterLevelRoute<GetChildRouteKey<K>> | LastLevelRoute<GetChildRouteKey<K>>)[];
      }
    : never;
  
  /**
   * the custom first level route
   */
  type CustomSingleLevelRoute<K extends CustomRouteKey = CustomRouteKey> = K extends string 
    ? Omit<RouteRecordRaw, 'name' | 'path' | 'component' | 'children'> & {
        path: RouteMap[K];
        component: \`${LAYOUT_PREFIX}\${RouteLayout}\`;
        children: [SingleLevelRouteChild<LastLevelRouteKey, K>];
      }
    : never;

  /**
   * the custom multi level route
   */
  type CustomMultiLevelRoute<K extends CustomRouteKey = CustomRouteKey> = K extends string
    ? Omit<RouteRecordRaw, 'name' | 'path' | 'component' | 'children' | 'redirect'> & {
        name: K;
        path: RouteMap[K];
        component: \`${LAYOUT_PREFIX}\${RouteLayout}\`;
        children: (CenterLevelRoute<CenterLevelRouteKey> | LastLevelRoute<LastLevelRouteKey>)[];
      }
    : never;

  /**
   * the custom redirect route
   */
  type CustomRedirectRoute<K extends CustomRouteKey = CustomRouteKey> = K extends string
    ? Omit<RouteRecordRaw, 'name' | 'path' | 'component' | 'children'> & {
        name: K;
        path: RouteMap[K];
        redirect: {
          name: Exclude<RouteKey, K>;
        };
      }
    : never;

  /**
   * the custom route
   */
  type CustomRoute = CustomSingleLevelRoute | CustomMultiLevelRoute | CustomRedirectRoute;

  /**
   * the elegant route
   */
  type ElegantRoute = SingleLevelRoute | MultiLevelRoute | CustomRoute;
}
`;

  return code;
}

export async function genDtsFile(
  files: ElegantRouterFile[],
  entries: ElegantRouterNamePathEntry[],
  options: ElegantVueRouterOption
) {
  if (files.length === 0) return;

  const customEntries = Object.entries(options.customRoutesMap);

  const code = getDtsCode(files, entries, customEntries, options.layouts);

  const dtsPath = path.posix.join(options.cwd, options.dtsDir);

  try {
    await ensureFile(dtsPath);
  } catch {}

  await writeFile(dtsPath, code);
}
