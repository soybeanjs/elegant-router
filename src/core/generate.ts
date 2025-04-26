import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { createPrefixCommentOfGenFile, ensureFile } from '../shared';
import { ELEGANT_ROUTER_TYPES_MODULE_NAME } from '../constants';
import type { AutoRouterNode, ParsedAutoRouterOptions } from '../types';

export async function generateTransformerFile(options: ParsedAutoRouterOptions) {
  const { cwd, routerGeneratedDir } = options;

  const transformerPath = path.posix.join(cwd, routerGeneratedDir, 'transformer.ts');

  await ensureFile(transformerPath);

  const code = getTransformerCode();

  await writeFile(transformerPath, code);
}

function getTransformerCode() {
  const prefixComment = createPrefixCommentOfGenFile();

  const code = `${prefixComment}

import type { RouteRecordRaw } from 'vue-router';
import type {
  AutoRouterRedirect,
  AutoRouterRoute,
  AutoRouterSingleView,
  RawRouteComponent,
  RouteFileKey,
  RouteLayoutKey
} from '${ELEGANT_ROUTER_TYPES_MODULE_NAME}';

export function transformToVueRoutes(
  routes: AutoRouterRoute[],
  layouts: Record<RouteLayoutKey, RawRouteComponent>,
  views: Record<RouteFileKey, RawRouteComponent>
) {
  const { redirects, groupedRoutes } = getFormattedRoutes(routes);

  const vueRoutes: RouteRecordRaw[] = [...redirects];

  groupedRoutes.forEach((items, layout) => {
    const layoutRoute: RouteRecordRaw = {
      path: \`/\${layout}-layout\`,
      component: layouts[layout],
      children: items.map(item => {
        const { layout: _, component, ...rest } = item;

        return {
          component: views[component],
          ...rest
        };
      })
    };

    vueRoutes.push(layoutRoute);
  });

  return vueRoutes;
}

function getFormattedRoutes(routes: AutoRouterRoute[]) {
  const groupedRoutes = new Map<RouteLayoutKey, AutoRouterSingleView[]>();
  const redirects: AutoRouterRedirect[] = [];

  routes.forEach(route => {
    if (isAutoRouterRedirect(route)) {
      redirects.push(route);
      return;
    }

    const items = groupedRoutes.get(route.layout) || [];
    items.push(route);
    groupedRoutes.set(route.layout, items);
  });

  return {
    redirects,
    groupedRoutes
  };
}

function isAutoRouterRedirect(route: AutoRouterRoute): route is AutoRouterRedirect {
  return 'redirect' in route;
}
`;

  return code;
}

export async function generateSharedFile(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const { cwd, routerGeneratedDir } = options;

  const sharedPath = path.posix.join(cwd, routerGeneratedDir, 'shared.ts');

  await ensureFile(sharedPath);

  const code = getSharedCode(nodes);

  await writeFile(sharedPath, code);
}

function getSharedCode(nodes: AutoRouterNode[]) {
  const prefixComment = createPrefixCommentOfGenFile();

  const code = `${prefixComment}

import type { RouteKey, RoutePath, RoutePathMap } from '${ELEGANT_ROUTER_TYPES_MODULE_NAME}';

const routePathMap: RoutePathMap = {
  ${nodes.map(node => `"${node.name}": "${node.path}",`).join('\n  ')}
};

export function getRoutePath(key: RouteKey) {
  return routePathMap[key];
}

export function getRouteName(path: RoutePath) {
  return Object.keys(routePathMap).find(key => routePathMap[key as RouteKey] === path) as RouteKey;
}
`;

  return code;
}
