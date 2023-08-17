import path from 'path';
import { PAGE_DEGREE_SPLITTER } from '@elegant-router/core';
import type { ElegantRouterFile, ElegantRouterNamePathEntry } from '@elegant-router/core';
import type { ElegantVueRouterOption } from '../types';
import { createFs } from '../shared/fs';
import { createPrefixCommentOfGenFile } from './comment';

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
   * the first level route, which contain the layout of the route
   */
  export type FirstLevelRoute = Extract<
    RouteKey,`;

  firstLevelEntries.forEach(routeName => {
    code += `\n    | "${routeName}"`;
  });

  code += `
  >;

  /**
   * the last level route, which has the page file
   */
  export type LastLevelRoute = Extract<
    RouteKey,`;

  files.forEach(file => {
    code += `\n    | "${file.routeName}"`;
  });

  code += `
  >;
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

  const fs = await createFs();

  const customEntries = Object.entries(options.customRoutesMap);

  const code = getDtsCode(files, entries, customEntries, options.layouts);

  const dtsPath = path.join(options.cwd, options.dtsDir);

  try {
    await fs.ensureFile(dtsPath);
  } catch {}

  await fs.writeFile(dtsPath, code);
}
