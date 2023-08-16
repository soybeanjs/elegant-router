/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'path';
import type { RouteRecordRaw } from 'vue-router';
import { loadFile, generateCode } from 'magicast';
import type { ElegantRouterTree } from '@elegant-router/core';
import { createPrefixCommentOfGenFile } from './comment';
import { createFs } from '../shared/fs';
import { formatCode } from '../shared/prettier';
import type { ElegantVueRouterOption } from '../types';

type AutoRoute = Omit<RouteRecordRaw, 'component' | 'children'> & {
  component?: string;
  children?: AutoRoute[];
};

interface RouteConstExport {
  autoRoutes: AutoRoute[];
}

async function getConstCode(trees: ElegantRouterTree[], options: ElegantVueRouterOption) {
  const { cwd, constDir } = options;
  const fs = await createFs();

  let code = '';

  const routeFilePath = path.join(cwd, constDir);

  try {
    await fs.ensureFile(routeFilePath);
  } catch {
    // code = await createRouteConst();
  } finally {
    const md = await loadFile<RouteConstExport>(routeFilePath);

    const autoRoutes = trees.map(item => transformRouteTreeToRouteRecordRaw(item, options));
    md.exports.autoRoutes = autoRoutes as any;
    const { code: mCode } = generateCode(md.$ast);
    code = transformComponent(mCode);
  }

  // if (splitModule) {
  //   // const moduleFilePath = path.join(cwd, dir, ROUTES_MODULE_DIR, ROUTES_FILE_NAME);
  // } else {
  // }
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

async function createRouteConst(autoRoutes: AutoRoute[], options: ElegantVueRouterOption) {
  const { cwd, importsDir, constDir } = options;
  const importsPath = path.join(cwd, importsDir);
  const constPath = path.join(cwd, constDir);

  const componentPath = getRelativeImport(constPath, importsPath);

  const prefixComment = createPrefixCommentOfGenFile();

  const code = `${prefixComment}

import type { RouteRecordRaw } from "vue-router";
import { views } from "${componentPath}";

export const autoRoutes: RouteRecordRaw[] = [];

`;

  return code;
}

export function updateRouteConst(oldConst: RouteConstExport, newConst: RouteConstExport) {
  //
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
  const { defaultLayout } = options;
  const { routeName, routePath, children = [] } = tree;

  const firstLevelRoute: AutoRoute = {
    name: routeName,
    path: routePath,
    component: `layouts.${defaultLayout}`,
    meta: {
      key: routeName
    }
  };

  if (children.length === 0) {
    firstLevelRoute.children = [
      {
        path: '.',
        component: `views.${routeName}`,
        meta: {
          key: routeName
        }
      }
    ];

    return firstLevelRoute;
  }

  const routeChildren = children.map(item => recursiveGetRouteRecordRawByChildTree(item));

  firstLevelRoute.children = routeChildren.flat(1);

  return firstLevelRoute;
}

function recursiveGetRouteRecordRawByChildTree(childTree: ElegantRouterTree): AutoRoute[] {
  const { routeName: cName, routePath: cPath, children: cChildren = [] } = childTree;

  const hasChildren = cChildren.length > 0;

  if (!hasChildren) {
    const lastLevelRoute: AutoRoute = {
      name: cName,
      path: cPath,
      component: `views.${cName}`,
      meta: {
        key: cName
      }
    };

    return [lastLevelRoute];
  }

  const [firstChild] = cChildren;

  const autoRoute: AutoRoute = {
    name: cName,
    path: cPath,
    redirect: firstChild.routePath,
    meta: {
      key: cName
    }
  };

  return [autoRoute, ...cChildren.map(item => recursiveGetRouteRecordRawByChildTree(item)).flat(1)];
}

// const importsPath = path.join(cwd, importsDir);
// const routeModulePath = path.join(cwd, moduleDir, `${routeName}.ts`);
// const constPath = path.join(cwd, constDir);

// const componentPath = splitModule
//   ? getRelativeImport(routeModulePath, importsPath)
//   : getRelativeImport(constPath, importsPath);

function getRelativeImport(from: string, to: string) {
  let relativePath = path.relative(path.dirname(from), to);

  if (!relativePath.startsWith('.')) {
    relativePath = path.format({ dir: '.', name: relativePath });
  }

  const ext = path.extname(relativePath);

  if (ext) {
    relativePath = relativePath.replace(ext, '');
  }

  return relativePath;
}

function transformComponent(routeJson: string) {
  const COMPONENT_REG = /"component":\s*"(.*?)"/g;

  const result = routeJson.replace(COMPONENT_REG, match => {
    const [component, viewOrLayout] = match.split(':');

    return `${component}: ${viewOrLayout.replace(/"/g, '')}`;
  });

  return result;
}
