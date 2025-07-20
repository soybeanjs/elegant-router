import { yellow } from 'kolorist';
import { getImportName, logger } from '../shared';
import { BUILT_IN_ROUTE, NOT_FOUND_ROUTE_NAME, NO_FILE_INODE, ROOT_ROUTE_NAME } from '../constants';
import type {
  AutoRouterNode,
  AutoRouterParamType,
  NodeStatInfo,
  ParsedAutoRouterOptions,
  ResolvedGlob
} from '../types';
import { getNodeBackup } from './temp';

export function resolveNodes(globs: ResolvedGlob[], options: ParsedAutoRouterOptions) {
  const nodes = globs.map(glob => resolveNode(glob, options));

  const builtinNodes = createBuiltinNode(options);
  const filteredNodes = filterConflictNodes(nodes);
  const reuseNodes = resolveReuseNode(options);

  const result = [...builtinNodes, ...filteredNodes, ...reuseNodes];

  result.sort((a, b) => sortNodeName(a.name, b.name));

  return result;
}

/**
 * 排序节点名称
 *
 * @param preName
 * @param curName
 */
export function sortNodeName(preName: string, curName: string) {
  if (preName === ROOT_ROUTE_NAME) {
    return -1;
  }

  if (curName === ROOT_ROUTE_NAME) {
    return 1;
  }

  if (preName === NOT_FOUND_ROUTE_NAME) {
    return -1;
  }

  if (curName === NOT_FOUND_ROUTE_NAME) {
    return 1;
  }

  return preName.localeCompare(curName);
}

export async function getNodeStatInfo(cwd: string, nodes: AutoRouterNode[]) {
  const preStat = await getNodeBackup(cwd);
  const preStatInodes = Object.values(preStat).map(item => item.inode);

  const info: NodeStatInfo = {
    add: [],
    rename: []
  };

  nodes.forEach(node => {
    const { name, inode } = node;

    if (inode === NO_FILE_INODE) return;

    const preInode = preStat[name];

    if (!preInode && !preStatInodes.includes(inode)) {
      info.add.push(node);
      return;
    }

    if (preStatInodes.includes(inode)) {
      const oldNodeName = Object.entries(preStat).find(([_, item]) => item.inode === inode)?.[0];

      if (oldNodeName && oldNodeName !== name) {
        info.rename.push({ ...node, oldNodeName });
      }
    }
  });

  return info;
}

export function resolveNode(resolvedGlob: ResolvedGlob, options: ParsedAutoRouterOptions) {
  const { getRouteName, getRoutePath, getRouteLayout, routeLazy } = options;

  const resolvedPath = resolveGlobPath(resolvedGlob, options.pageExtension);

  let node: AutoRouterNode = {
    ...resolvedGlob,
    path: resolvedPath,
    name: '',
    originPath: resolvedPath,
    get component() {
      return node.name;
    },
    get layout() {
      return getRouteLayout(node);
    },
    get importName() {
      return getImportName(node.name);
    },
    get isLazy() {
      return routeLazy(node);
    }
  };

  node = resolveGroupNode(node);
  node = resolveParamNode(node);
  node.name = getRouteName(node);
  node.path = getRoutePath(node);

  return node;
}

function resolveReuseNode(options: ParsedAutoRouterOptions) {
  const { reuseRoutes, defaultReuseRouteComponent } = options;

  const nodes: AutoRouterNode[] = [];

  reuseRoutes.forEach(path => {
    let node: AutoRouterNode = createEmptyReuseNode(path, options);
    node.component = defaultReuseRouteComponent;

    node = resolveParamNode(node);

    nodes.push(node);
  });

  return nodes;
}

function createBuiltinNode(options: ParsedAutoRouterOptions) {
  const { notFoundRouteComponent, getRouteLayout } = options;

  const rootPath = BUILT_IN_ROUTE[ROOT_ROUTE_NAME];

  const rootNode: AutoRouterNode = {
    path: rootPath,
    name: ROOT_ROUTE_NAME,
    originPath: rootPath,
    component: '',
    layout: '',
    isBuiltin: true,
    pageDir: '',
    glob: '',
    filePath: '',
    importName: '',
    importPath: '',
    inode: NO_FILE_INODE
  };

  const notFoundPath = BUILT_IN_ROUTE[NOT_FOUND_ROUTE_NAME];

  const notFoundNode: AutoRouterNode = {
    path: notFoundPath,
    name: NOT_FOUND_ROUTE_NAME,
    originPath: notFoundPath,
    component: notFoundRouteComponent,
    get layout() {
      return getRouteLayout(notFoundNode);
    },
    isBuiltin: true,
    pageDir: '',
    glob: '',
    filePath: '',
    importName: '',
    importPath: '',
    inode: NO_FILE_INODE
  };

  return [rootNode, notFoundNode];
}

function createEmptyReuseNode(path: string, options: ParsedAutoRouterOptions) {
  const { getRouteName, getRoutePath, getRouteLayout } = options;

  let node: AutoRouterNode = {
    path,
    name: '',
    originPath: path,
    component: '',
    get layout() {
      return getRouteLayout(node);
    },
    isReuse: true,
    pageDir: '',
    glob: '',
    filePath: '',
    importName: '',
    importPath: '',
    inode: NO_FILE_INODE
  };

  node = resolveParamNode(node);
  node.name = getRouteName(node);
  node.path = getRoutePath(node);

  return node;
}

function resolveGlobPath(resolvedGlob: ResolvedGlob, extension: string[]) {
  const { glob } = resolvedGlob;

  let globPath = glob;
  if (!globPath.startsWith('/')) {
    globPath = `/${globPath}`;
  }

  extension.forEach(ext => {
    if (globPath.endsWith(`.${ext}`)) {
      globPath = globPath.replace(`.${ext}`, '');
    }
  });

  if (globPath.endsWith('/index')) {
    globPath = globPath.replace(/\/index$/, '');
  }

  return globPath;
}

/**
 * 解析分组节点
 *
 * @example
 *   `src/pages/(builtin)/login/index.vue`;
 *
 * @param glob
 */
function resolveGroupNode(node: AutoRouterNode) {
  const GROUP_REG = /\/\((\w+)\)\//;

  const match = node.path.match(GROUP_REG);

  if (match) {
    const [matchItem, group] = match;
    node.group = group;
    node.path = node.path.replace(matchItem, '/');
  }

  return node;
}

/**
 * 解析参数节点
 *
 * @example
 *   `src/pages/list/[id].vue`;
 *   `src/pages/list/[[id]].vue`;
 *   `src/pages/list/edit_[id]_[userId].vue`;
 *   `src/pages/list/detail/[id]/[userId].vue`;
 *
 * @param node
 */
function resolveParamNode(node: AutoRouterNode) {
  // 1. 先将 [id]/[[id]] 转换为 /:id/:id?
  const optional = getOptionalParamsByPath(node.path);
  if (optional) {
    node.path = optional.path;
  } else {
    const required = getParamsByPath(node.path);
    if (required) {
      node.path = required.path;
    }
  }
  // 2. 再统一从 /:id/:id? 这种格式中提取参数
  const paramInfo = getParamsFromRoutePath(node.path);
  if (paramInfo?.params) {
    node.params = { ...node.params, ...paramInfo.params };
  }

  return node;
}

/**
 * 从 '/:id/:userId?' 这种格式中提取参数
 *
 * @param nodePath
 */
function getParamsFromRoutePath(nodePath: string) {
  // 匹配 :param 和 :param?，不匹配 ::
  const PARAM_REG = /:(\w+)(\?)?/g;
  const params: Record<string, AutoRouterParamType> = {};
  let match: RegExpExecArray | null;

  while ((match = PARAM_REG.exec(nodePath)) !== null) {
    const [, param, optional] = match;
    params[param] = optional === '?' ? 'optional' : 'required';
  }

  return Object.keys(params).length > 0 ? { params, path: nodePath } : null;
}

function getOptionalParamsByPath(nodePath: string) {
  const OPTIONAL_PARAM_REG = /\[\[(\w+)\]\]/g;

  const match = nodePath.match(OPTIONAL_PARAM_REG);

  if (!match) {
    return null;
  }

  const params: Record<string, AutoRouterParamType> = {};
  let formatPath = nodePath;

  match.forEach(item => {
    const param = item.slice(2, -2);
    params[param] = 'optional';
  });

  formatPath = nodePath.replace(OPTIONAL_PARAM_REG, ':$1?');
  formatPath = formatPath.replace(/_:/g, '/:');

  const BETWEEN_REG = /\/:\w+\??\w+\/:/;
  formatPath = formatPath.replace(BETWEEN_REG, item => item.replace('_', '/'));

  return { params, path: formatPath };
}

function getParamsByPath(nodePath: string) {
  const PARAM_REG = /\[(\w+)\]/g;

  const match = nodePath.match(PARAM_REG);

  if (!match) {
    return null;
  }

  const params: Record<string, AutoRouterParamType> = {};

  let formatPath = nodePath;

  match.forEach(item => {
    const param = item.slice(1, -1);
    params[param] = 'required';
  });

  formatPath = nodePath.replace(PARAM_REG, ':$1');
  formatPath = formatPath.replace(/_:/g, '/:');

  const BETWEEN_REG = /\/:\w+\??\w+\/:/;
  formatPath = formatPath.replace(BETWEEN_REG, item => item.replace('_', '/'));

  return { params, path: formatPath };
}

function filterConflictNodes(nodes: AutoRouterNode[]) {
  const nodeMap = new Map<string, AutoRouterNode[]>();

  nodes.forEach(node => {
    const items = nodeMap.get(node.name) ?? [];

    items.push(node);

    nodeMap.set(node.name, items);
  });

  const result: AutoRouterNode[] = [];

  const conflictNodes: AutoRouterNode[] = [];

  nodeMap.forEach(items => {
    result.push(items[0]);

    if (items.length > 1) {
      conflictNodes.push(...items);
    }
  });

  if (conflictNodes.length > 0) {
    logger.warn(`${yellow('conflict routes, use the first one by default【路由冲突，默认取第一个】: ')}`);
    logger.table(
      conflictNodes.map(item => ({
        name: item.name,
        path: item.path,
        glob: item.glob
      }))
    );
  }

  return result;
}
