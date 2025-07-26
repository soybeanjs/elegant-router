import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { createPrefixCommentOfGenFile, ensureFile } from '../shared';
import type { AutoRouterNode, ParsedAutoRouterOptions } from '../types';
import {
  ELEGANT_ROUTER_TYPES_MODULE_NAME,
  NOT_FOUND_ROUTE_NAME,
  ROOT_ROUTE_NAME,
  VUE_ROUTER_MODULE_NAME
} from '../constants';

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
  const reuseNodes = nodes.filter(node => node.isReuse);

  const prefixComment = createPrefixCommentOfGenFile();

  let code = `${prefixComment}

declare module "${ELEGANT_ROUTER_TYPES_MODULE_NAME}" {
  type RouteRecordSingleView = import("vue-router").RouteRecordSingleView;
  type RouteRecordRedirect = import("vue-router").RouteRecordRedirect;
  type RouteComponent = import("vue-router").RouteComponent;

  type Lazy<T> = () => Promise<T>;

  export type RawRouteComponent = RouteComponent | Lazy<RouteComponent>;

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
   * root route key
   */
  export type RootRouteKey = '${ROOT_ROUTE_NAME}';

  /**
   * not found route key
   */
  export type NotFoundRouteKey = '${NOT_FOUND_ROUTE_NAME}';

  /**
   * builtin route key
   */
  export type BuiltinRouteKey = RootRouteKey | NotFoundRouteKey;`;

  code += getReuseRouteDtsCode(reuseNodes);

  code += `

  /**
   * the route file key, which has it's own file
   */
  export type RouteFileKey = Exclude<RouteKey, BuiltinRouteKey | ReuseRouteKey>;

  /**
   * mapped name and path
   */
  type MappedNamePath = {
    [K in RouteKey]: { name: K; path: RoutePathMap[K] };
  }[RouteKey];

  /**
   * auto router single view
   */
  export type AutoRouterSingleView = Omit<RouteRecordSingleView, 'component' | 'name' | 'path'> & {
    component: RouteFileKey;
    layout: RouteLayoutKey;
  } & MappedNamePath;

  /**
   * auto router redirect
   */
  export type AutoRouterRedirect = Omit<RouteRecordRedirect, 'children' | 'name' | 'path'> & MappedNamePath;

  /**
   * auto router route
   */
  export type AutoRouterRoute = AutoRouterSingleView | AutoRouterRedirect;
}
`;

  return code;
}

function getReuseRouteDtsCode(nodes: AutoRouterNode[]) {
  if (!nodes.length) {
    return `

  /**
   * reuse route key
   */
  export type ReuseRouteKey = never;`;
  }

  let code = `

  /**
   * reuse route key
   */
  export type ReuseRouteKey = Extract<
    RouteKey,`;

  nodes.forEach(node => {
    code += `\n    | "${node.name}"`;
  });

  code += `
  >;`;

  return code;
}

function getVueRouterDtsCode(nodes: AutoRouterNode[]) {
  const prefixComment = createPrefixCommentOfGenFile(true);

  const code = `${prefixComment}

export {}

declare module "vue-router" {
  type RouteNamedMap = import("${VUE_ROUTER_MODULE_NAME}").RouteNamedMap;

  export interface TypesConfig {
    RouteNamedMap: RouteNamedMap;
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
