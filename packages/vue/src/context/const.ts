import path from 'path';
import { loadFile, generateCode } from 'magicast';
import { PAGE_DEGREE_SPLITTER } from '@elegant-router/core';
import type { ElegantRouterTree } from '@elegant-router/core';
import { createPrefixCommentOfGenFile } from './comment';
import { createFs } from '../shared/fs';
import { formatCode } from '../shared/prettier';
import { LAYOUT_PREFIX, VIEW_PREFIX } from '../constants';
import type { ElegantVueRouterOption, AutoRoute } from '../types';

interface RouteConstExport {
  autoRoutes: AutoRoute[];
}

async function getConstCode(trees: ElegantRouterTree[], options: ElegantVueRouterOption) {
  const { cwd, constDir } = options;
  const fs = await createFs();

  const routeFilePath = path.join(cwd, constDir);

  const existFile = await fs.exists(routeFilePath);

  if (!existFile) {
    const code = await createEmptyRouteConst();
    await fs.writeFile(routeFilePath, code, 'utf-8');
  }

  const md = await loadFile<RouteConstExport>(routeFilePath, { parser: require('recast/parsers/typescript') });

  const autoRoutes = trees.map(item => transformRouteTreeToRouteRecordRaw(item, options));

  const updated = getUpdatedRouteConst(md.exports.autoRoutes as AutoRoute[], autoRoutes);

  md.exports.autoRoutes = updated as any;

  let { code } = generateCode(md);
  code = transformComponent(code);

  const formattedCode = await formatCode(code);

  const removedEmptyLineCode = formattedCode.replace(/,\n\n/g, `,\n`);

  return removedEmptyLineCode;
}

export async function genConstFile(tree: ElegantRouterTree[], options: ElegantVueRouterOption) {
  const { cwd, constDir } = options;

  const fs = await createFs();

  const routesFilePath = path.join(cwd, constDir);

  const code = await getConstCode(tree, options);

  await fs.writeFile(routesFilePath, code, 'utf8');
}

async function createEmptyRouteConst() {
  const prefixComment = createPrefixCommentOfGenFile(false);

  const code = `${prefixComment}

import type { ElegantRoute } from '@elegant-router/types';

export const autoRoutes: ElegantRoute[] = [];

`;

  return code;
}

export function getUpdatedRouteConst(oldConst: AutoRoute[], newConst: AutoRoute[]) {
  const updated = newConst.map(item => {
    const findItem = oldConst.find(i => (i?.name && i.name === item?.name) || i.path === item.path);

    if (!findItem) {
      return item;
    }

    const isFirstLevel = !findItem?.name || (findItem.name as string).split(PAGE_DEGREE_SPLITTER).length === 1;

    if (isFirstLevel) {
      return findItem;
    }

    findItem.children = getUpdatedRouteConst(findItem.children || [], item.children || []);

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
