import path from 'node:path';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { loadFile, generateCode } from 'magicast';
import { parse } from 'recast/parsers/typescript';
import type { ElegantRouterTree } from '@elegant-router/core';
import { createPrefixCommentOfGenFile } from './comment';

import { formatCode } from '../shared/prettier';
import { LAYOUT_PREFIX, VIEW_PREFIX } from '../constants';
import type { ElegantVueRouterOption, AutoRoute } from '../types';

interface RouteConstExport {
  autoRoutes: AutoRoute[];
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

  const autoRoutes = trees.map(item => transformRouteTreeToRouteRecordRaw(item, options));

  const updated = getUpdatedRouteConst(md.exports.autoRoutes as AutoRoute[], autoRoutes, options);

  md.exports.autoRoutes = updated as any;

  let { code } = generateCode(md);
  code = transformComponent(code);

  const formattedCode = await formatCode(code);

  const removedEmptyLineCode = formattedCode.replace(/,\n\n/g, `,\n`);

  return removedEmptyLineCode;
}

export async function genConstFile(tree: ElegantRouterTree[], options: ElegantVueRouterOption) {
  const { cwd, constDir } = options;

  const routesFilePath = path.posix.join(cwd, constDir);

  const code = await getConstCode(tree, options);

  await writeFile(routesFilePath, code, 'utf8');
}

async function createEmptyRouteConst() {
  const prefixComment = createPrefixCommentOfGenFile(false);

  const code = `${prefixComment}

import type { ElegantRoute } from '@elegant-router/types';

export const autoRoutes: ElegantRoute[] = [];

`;

  return code;
}

function isValidLayout(layout: string, layouts: Record<string, string>) {
  const layoutName = layout.replace(LAYOUT_PREFIX, '');

  return Boolean(layouts[layoutName]);
}

export function getUpdatedRouteConst(oldConst: AutoRoute[], newConst: AutoRoute[], options: ElegantVueRouterOption) {
  const updated = newConst.map(item => {
    const hasName = Boolean(item?.name);

    const findItem = oldConst.find(i => (hasName && i.name === item.name) || i.path === item.path);

    if (!findItem) {
      return item;
    }

    if (hasName) {
      findItem.path = item.path;
    }

    if (findItem.component) {
      /**
       * invalid layout
       * @description maybe the layouts are updated
       */
      const isInValidLayout =
        findItem.component.includes(LAYOUT_PREFIX) && !isValidLayout(findItem.component, options.layouts);

      if (!isInValidLayout) {
        findItem.component = item.component;
      }
    }

    if (findItem.redirect) {
      findItem.redirect = item.redirect;
    }

    const children = getUpdatedRouteConst(findItem.children || [], item.children || [], options);

    if (children.length) {
      findItem.children = children;
    }

    return findItem;
  });

  return updated;
}

export function getRouteConstExport(trees: ElegantRouterTree[], options: ElegantVueRouterOption) {
  const autoRoutes = trees.map(item => transformRouteTreeToRouteRecordRaw(item, options));

  return { autoRoutes };
}

/**
 * transform ElegantRouter route tree to vue-router route
 * @param tree the ElegantRouter route tree
 * @param options the plugin options
 */
function transformRouteTreeToRouteRecordRaw(tree: ElegantRouterTree, options: ElegantVueRouterOption) {
  const { defaultLayout, onRouteMetaGen } = options;
  const { routeName, routePath, children = [] } = tree;

  const firstLevelRoute: AutoRoute = {
    path: routePath,
    component: `${LAYOUT_PREFIX}${defaultLayout}`
  };

  if (children.length === 0) {
    firstLevelRoute.children = [
      {
        name: routeName,
        path: '',
        component: `${VIEW_PREFIX}${routeName}`,
        meta: onRouteMetaGen(routeName)
      }
    ];

    return firstLevelRoute;
  }

  const routeChildren = getRouteRecordRawByChildTrees(children, options);

  const route: AutoRoute = {
    name: routeName,
    path: firstLevelRoute.path,
    component: firstLevelRoute.component,
    redirect: {
      name: routeChildren[0].name
    },
    meta: onRouteMetaGen(routeName),
    children: routeChildren
  };

  return route;
}

function getRouteRecordRawByChildTrees(childTrees: ElegantRouterTree[], options: ElegantVueRouterOption) {
  const children = childTrees.map(item => recursiveGetRouteRecordRawByChildTree(item, options));

  return children.flat(1);
}

function recursiveGetRouteRecordRawByChildTree(
  childTree: ElegantRouterTree,
  options: ElegantVueRouterOption
): AutoRoute[] {
  const { onRouteMetaGen } = options;
  const { routeName: cName, routePath: cPath, children: cChildren = [] } = childTree;

  const hasChildren = cChildren.length > 0;

  if (!hasChildren) {
    const lastLevelRoute: AutoRoute = {
      name: cName,
      path: cPath,
      component: `${VIEW_PREFIX}${cName}`,
      meta: onRouteMetaGen(cName)
    };

    return [lastLevelRoute];
  }

  const [firstChild] = cChildren;

  const autoRoute: AutoRoute = {
    name: cName,
    path: cPath,
    redirect: {
      name: firstChild.routeName
    },
    meta: onRouteMetaGen(cName)
  };

  return [autoRoute, ...cChildren.map(item => recursiveGetRouteRecordRawByChildTree(item, options)).flat(1)];
}

function transformComponent(routeJson: string) {
  const COMPONENT_REG = /"component":\s*"(.*?)"/g;

  const result = routeJson.replace(COMPONENT_REG, match => {
    const [component, viewOrLayout] = match.split(':');

    return `${component}: ${viewOrLayout.replace(/"/g, '')}`;
  });

  return result;
}
