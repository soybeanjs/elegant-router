import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { createPrefixCommentOfGenFile, ensureFile } from '../shared';
import type { AutoRouterNode, ParsedAutoRouterOptions } from '../types';
import { ELEGANT_ROUTER_TYPES_MODULE_NAME, VUE_ROUTER_MODULE_NAME } from './constant';

export async function generateDtsFile(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const dtsPath = path.posix.join(options.cwd, options.dts);
  const vueRouterDtsPath = path.posix.join(options.cwd, options.vueRouterDts);

  await ensureFile(dtsPath);
  await ensureFile(vueRouterDtsPath);

  const code = getDtsCode(nodes, options);
  await writeFile(dtsPath, code);

  const vueRouterCode = getVueRouterDtsCode(nodes);
  await writeFile(vueRouterDtsPath, vueRouterCode);
}

function getDtsCode(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const { layouts } = options;

  const layoutKeys = layouts.map(layout => layout.name);
  const customNodes = nodes.filter(node => node.isCustom);

  const prefixComment = createPrefixCommentOfGenFile();

  let code = `${prefixComment}

declare module "${ELEGANT_ROUTER_TYPES_MODULE_NAME}" {
  /**
   * route layout key
   */
  export type RouteLayoutKey = ${layoutKeys.map(key => `"${key}"`).join(' | ')};

  /**
   * route path map
   */
  export type RoutePathMap = {`;

  nodes.forEach(node => {
    code += `\n    "${node.name}": "${node.path}";`;
  });

  code += `
  };

  /**
   * route key
   */
  export type RouteKey = keyof RoutePathMap;

  /**
   * route path
   */
  export type RoutePath = RoutePathMap[RouteKey];

  /**
   * custom route key
   */
  export type CustomRouteKey = Extract<
    RouteKey,`;

  customNodes.forEach(node => {
    code += `\n    | "${node.name}"`;
  });

  code += `
  >;

  /**
   * the route file key, which has it's own file
   */
  export type RouteFileKey = Exclude<RouteKey, CustomRouteKey>;
}
`;

  return code;
}

function getVueRouterDtsCode(nodes: AutoRouterNode[]) {
  const prefixComment = createPrefixCommentOfGenFile();

  const code = `${prefixComment}

export {}

declare module "vue-router" {
  import type { RouteNamedMap } from '${VUE_ROUTER_MODULE_NAME}';

  export interface TypesConfig {
    RouteNamedMap: RouteNamedMap
  }
}

declare module "${VUE_ROUTER_MODULE_NAME}" {
  import type { RouteParamsRawGeneric, RouteParamsGeneric, RouteMeta, RouteRecordInfo, ParamValue, ParamValueZeroOrOne } from "vue-router";

  /**
   * route named map
  */
  export interface RouteNamedMap {
    ${nodes.map(node => `"${node.name}": RouteRecordInfo<"${node.name}", "${node.path}", ${generateRouteParams(node, true)}, ${generateRouteParams(node, false)}>`).join(';\n    ')}
  }
}
`;

  return code;
}

export function generateRouteParams(node: AutoRouterNode, isRaw: boolean) {
  const { params } = node;

  const paramEntries = Object.entries(params || {});

  if (!paramEntries.length) {
    return 'Record<never, never>';
  }

  const paramsCode = `{ ${paramEntries
    .map(
      ([paramName, paramType]) =>
        `${paramName}${paramType === 'optional' ? '?' : ''}: ${paramType === 'optional' ? `ParamValueZeroOrOne<${isRaw}>` : `ParamValue<${isRaw}>`}`
    )
    .join(', ')} }`;

  return paramsCode;
}
