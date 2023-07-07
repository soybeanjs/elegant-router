import path from 'path';
import type {
  ElegantRouterOption,
  ElegantRouterFile,
  ElegantRouterNamePathMap,
  ElegantRouterNamePathEntry,
  ElegantRouterTree
} from '../types';
import { getFullPathOfPageGlob } from './path';
import { PATH_SPLITTER, PAGE_DEGREE_SPLITTER, PAGE_FILE_NAME_WITH_SQUARE_BRACKETS_PATTERN } from '../constants';

/**
 * transform the page glob to the router file
 * @param glob
 * @param options
 */
export function transformPageGlobToRouterFile(glob: string, options: ElegantRouterOption) {
  const { cwd, pageDir, pageDirAlias, routeNameTransformer } = options;

  // 1. get path info
  const fullPath = getFullPathOfPageGlob(glob, pageDir, cwd);
  const importPath = path.join(pageDirAlias || pageDir, glob);

  // 2. get route info
  const dirAndFile = glob.split(PATH_SPLITTER).reverse();
  const [file, ...dirs] = dirAndFile;

  const filteredDirs = dirs.filter(dir => !dir.startsWith(PAGE_DEGREE_SPLITTER)).reverse();

  const routeName = routeNameTransformer(filteredDirs.join(PAGE_DEGREE_SPLITTER).toLocaleLowerCase());
  let routePath = transformRouterNameToPath(routeName);

  let routeParamKey = '';

  if (PAGE_FILE_NAME_WITH_SQUARE_BRACKETS_PATTERN.test(file)) {
    const [fileName] = file.split('.');
    routeParamKey = fileName.replace(/\[|\]/g, '');
    routePath = `${routePath}/:${routeParamKey}`;
  }

  const item: ElegantRouterFile = {
    glob,
    fullPath,
    importPath,
    routeName,
    routePath: options.routePathTransformer(routeName, routePath),
    routeParamKey
  };

  return item;
}

/**
 * transform the router files to the router maps (name -> path)
 * @param files
 * @param options
 */
export function transformRouterFilesToMaps(files: ElegantRouterFile[], options: ElegantRouterOption) {
  const maps: ElegantRouterNamePathMap = new Map<string, string>();

  files.forEach(file => {
    const { routeName, routePath } = file;

    const names = splitRouterName(routeName);

    names.forEach(name => {
      if (!maps.has(name)) {
        const isSameName = name === routeName;

        const itemRouteName = isSameName ? name : options.routeNameTransformer(name);
        const itemRoutePath = isSameName
          ? routePath
          : options.routePathTransformer(itemRouteName, transformRouterNameToPath(name));

        maps.set(itemRouteName, itemRoutePath);
      }
    });
  });

  return maps;
}

/**
 * transform the router files to the router entries (name -> path)
 * @param maps
 */
export function transformRouterMapsToEntries(maps: ElegantRouterNamePathMap) {
  const entries: ElegantRouterNamePathEntry[] = [];

  maps.forEach((routePath, routeName) => {
    entries.push([routeName, routePath]);
  });

  return entries.sort((a, b) => a[0].localeCompare(b[0]));
}

/**
 * transform the router entries to the router trees
 * @param entries
 * @param options
 */
export function transformRouterEntriesToTrees(entries: ElegantRouterNamePathEntry[], maps: ElegantRouterNamePathMap) {
  const treeWithClassify: Record<string, string[][]> = {};

  entries.forEach(([routeName]) => {
    const isFirstLevel = routeName.includes(PAGE_DEGREE_SPLITTER);

    if (isFirstLevel) {
      treeWithClassify[routeName] = [];
    } else {
      const levels = routeName.split(PAGE_DEGREE_SPLITTER).length;
      const levelNames = treeWithClassify[routeName][levels - 2];

      treeWithClassify[routeName][levels - 2] = [...(levelNames || []), routeName];
    }
  });

  const trees: ElegantRouterTree[] = [];

  Object.keys(treeWithClassify).forEach(moduleName => {
    const firstLevelRoute: ElegantRouterTree = {
      routeName: moduleName,
      routePath: maps.get(moduleName) || ''
    };

    const children = treeWithClassify[moduleName];

    const treeChildren = recursiveGetRouteTreeChildren(moduleName, children, maps);

    if (treeChildren.length > 0) {
      firstLevelRoute.children = treeChildren;
    }
  });

  return trees;
}

/**
 * recursive get the route tree children
 * @param parentName
 * @param children
 * @param maps
 */
function recursiveGetRouteTreeChildren(parentName: string, children: string[][], maps: ElegantRouterNamePathMap) {
  if (children.length === 0) {
    return [];
  }

  const [current, ...rest] = children;

  const currentChildren = current.filter(name => name.startsWith(parentName));

  const trees = currentChildren.map(name => {
    const tree: ElegantRouterTree = {
      routeName: name,
      routePath: maps.get(name) || ''
    };

    const nextChildren = recursiveGetRouteTreeChildren(name, rest, maps);

    if (nextChildren.length > 0) {
      tree.children = nextChildren;
    }
    return tree;
  });

  return trees;
}

/**
 *  split the router name
 * @param name
 * @example "a_b_c" => ["a", "a_b", "a_b_c"]
 */
function splitRouterName(name: string) {
  const names = name.split(PAGE_DEGREE_SPLITTER);

  return names.reduce((prev, cur) => {
    const last = prev[prev.length - 1];

    const next = last ? `${last}${PAGE_DEGREE_SPLITTER}${cur}` : cur;

    prev.push(next);

    return prev;
  }, [] as string[]);
}

/**
 * transform the router name to the router path
 * @param name
 * @example "a_b_c" => "/a/b/c"
 */
function transformRouterNameToPath(name: string) {
  const routerPath = PATH_SPLITTER + name.replaceAll(PAGE_DEGREE_SPLITTER, PATH_SPLITTER);

  return routerPath;
}
