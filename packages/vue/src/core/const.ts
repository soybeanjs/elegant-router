import path from 'node:path';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { loadFile, generateCode } from 'magicast';
import { parse } from 'recast/parsers/typescript.js';
import { PAGE_DEGREE_SPLITTER } from '@elegant-router/core';
import type { ElegantRouterTree } from '@elegant-router/core';
import { createPrefixCommentOfGenFile } from './comment';
import { formatCode } from '../shared/prettier';
import { LAYOUT_PREFIX, VIEW_PREFIX, FIRST_LEVEL_ROUTE_COMPONENT_SPLIT } from '../constants';
import type { ElegantVueRouterOption, RouteConstExport, ElegantConstRoute } from '../types';

export async function genConstFile(tree: ElegantRouterTree[], options: ElegantVueRouterOption) {
  const { cwd, constDir } = options;

  const routesFilePath = path.posix.join(cwd, constDir);

  const code = await getConstCode(tree, options);

  await writeFile(routesFilePath, code, 'utf8');
}

async function getConstCode(trees: ElegantRouterTree[], options: ElegantVueRouterOption) {
  const { cwd, constDir } = options;
  const routeFilePath = path.posix.join(cwd, constDir);

  const existFile = existsSync(routeFilePath);

  if (!existFile) {
    const code = await createEmptyRouteConst();
    await writeFile(routeFilePath, code, 'utf-8');
  }

  const md = await loadFile<RouteConstExport>(routeFilePath, { parser: { parse } });

  const autoRoutes = trees.map(item => transformRouteTreeToElegantConstRoute(item, options));

  const oldRoutes = JSON.parse(JSON.stringify(md.exports.generatedRoutes)) as ElegantConstRoute[];

  const updated = getUpdatedRouteConst(oldRoutes, autoRoutes, options);

  md.exports.generatedRoutes = updated as any;

  let { code } = generateCode(md);
  code = transformComponent(code);

  const formattedCode = await formatCode(code);

  const removedEmptyLineCode = formattedCode.replace(/,\n\n/g, `,\n`);

  return removedEmptyLineCode;
}

async function createEmptyRouteConst() {
  const prefixComment = createPrefixCommentOfGenFile();

  const code = `${prefixComment}

import type { GeneratedRoute } from '@elegant-router/types';

export const generatedRoutes: GeneratedRoute[] = [];

`;

  return code;
}

function getUpdatedRouteConst(
  oldConst: ElegantConstRoute[],
  newConst: ElegantConstRoute[],
  options: ElegantVueRouterOption
) {
  const oldRouteMap = getElegantConstRouteMap(oldConst);

  const updated = newConst.map(item => {
    const oldRoute = oldRouteMap.get(item.name);

    if (!oldRoute) {
      return item;
    }

    const { name, path: routePath, component, children, meta, ...rest } = item;

    const updatedRoute = { ...oldRoute, path: routePath };

    const isFirstLevel = !name.includes(PAGE_DEGREE_SPLITTER) && !children?.length;

    if (oldRoute.component && component) {
      if (isFirstLevel) {
        const { layoutName: oldLayoutName } = resolveFirstLevelRouteComponent(oldRoute.component);
        const { layoutName: newLayoutName } = resolveFirstLevelRouteComponent(component);
        const hasLayout = Boolean(options.layouts[oldLayoutName]);

        const layoutName = hasLayout ? oldLayoutName : newLayoutName;
        const viewName = item.name;

        updatedRoute.component = getFirstLevelRouteComponent(viewName, layoutName);
      } else {
        const isView = oldRoute.component.startsWith(VIEW_PREFIX);
        const isLayout = oldRoute.component.startsWith(LAYOUT_PREFIX);
        const layoutName = oldRoute.component.replace(LAYOUT_PREFIX, '');
        const hasLayout = Boolean(options.layouts[layoutName]);

        if (isView || (isLayout && !hasLayout)) {
          updatedRoute.component = component;
        }
      }
    }

    mergeObject(updatedRoute, rest);

    if (!updatedRoute.meta && meta) {
      updatedRoute.meta = meta;
    }

    if (updatedRoute.meta && meta) {
      mergeObject(updatedRoute.meta, meta);
    }

    if (children?.length) {
      updatedRoute.children = getUpdatedRouteConst(oldRoute?.children || [], children, options);
    }

    return updatedRoute;
  });

  return updated;
}

function mergeObject<T extends Record<string, unknown>>(target: T, source: T) {
  const keys = Object.keys(source) as (keyof T)[];

  keys.forEach(key => {
    if (!target[key]) {
      Object.assign(target, { [key]: source[key] });
    }
  });
}

function getElegantConstRouteMap(constRoutes: ElegantConstRoute[]) {
  const routeMap = new Map<string, ElegantConstRoute>();

  function recursiveGetElegantConstRoute(routes: ElegantConstRoute[]) {
    routes.forEach(item => {
      const { name, children } = item;

      routeMap.set(name, item);

      if (children?.length) {
        recursiveGetElegantConstRoute(children);
      }
    });
  }

  recursiveGetElegantConstRoute(constRoutes);

  return routeMap;
}

/**
 * transform ElegantRouter route tree to ElegantConstRoute
 * @param tree the ElegantRouter route tree
 * @param options the plugin options
 */
function transformRouteTreeToElegantConstRoute(tree: ElegantRouterTree, options: ElegantVueRouterOption) {
  const { defaultLayout, onRouteMetaGen } = options;
  const { routeName, routePath, children = [] } = tree;

  const layoutComponent = `${LAYOUT_PREFIX}${defaultLayout}`;
  const firstLevelRouteComponent = getFirstLevelRouteComponent(routeName, defaultLayout);

  const hasChildren = children.length > 0;

  const route: ElegantConstRoute = {
    name: routeName,
    path: routePath,
    component: hasChildren ? layoutComponent : firstLevelRouteComponent
  };

  const hasParams = routePath.includes(':');

  if (hasParams) {
    route.props = true;
  }

  route.meta = onRouteMetaGen(routeName);

  if (hasChildren) {
    route.children = children.map(item => recursiveGetElegantConstRouteByChildTree(item, options));
  }

  return route;
}

function recursiveGetElegantConstRouteByChildTree(
  childTree: ElegantRouterTree,
  options: ElegantVueRouterOption
): ElegantConstRoute {
  const { onRouteMetaGen } = options;
  const { routeName, routePath, children = [] } = childTree;

  const viewComponent = `${VIEW_PREFIX}${routeName}`;

  const hasChildren = children.length > 0;

  const route: ElegantConstRoute = {
    name: routeName,
    path: routePath
  };

  if (!hasChildren) {
    route.component = viewComponent;
    route.meta = onRouteMetaGen(routeName);
  } else {
    route.meta = onRouteMetaGen(routeName);
    const routeChildren = children.map(item => recursiveGetElegantConstRouteByChildTree(item, options));
    route.children = routeChildren;
  }

  return route;
}

function getFirstLevelRouteComponent(routeName: string, layoutName: string) {
  const routeComponent = `${LAYOUT_PREFIX}${layoutName}${FIRST_LEVEL_ROUTE_COMPONENT_SPLIT}${VIEW_PREFIX}${routeName}`;

  return routeComponent;
}

function resolveFirstLevelRouteComponent(component: string) {
  const [layoutName, viewName] = component.split(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT);

  return {
    layoutName: layoutName.replace(LAYOUT_PREFIX, ''),
    viewName: viewName.replace(VIEW_PREFIX, '')
  };
}

function transformComponent(routeJson: string) {
  const COMPONENT_REG = /"component":\s*"(.*?)"/g;

  const result = routeJson.replace(COMPONENT_REG, match => {
    const [component, viewOrLayout] = match.split(':');

    return `${component}: ${viewOrLayout.replace(/"/g, '')}`;
  });

  return result;
}
