import { yellow } from 'kolorist';
import { getImportName, logger } from '../shared';
import { NOT_FOUND_ROUTE_NAME, NO_FILE_INODE, ROOT_ROUTE_NAME } from '../constants';
import type {
  AutoRouterNode,
  AutoRouterParamType,
  NodeStatInfo,
  ParsedAutoRouterOptions,
  ResolvedGlob
} from '../types';
import { getTempNode } from './temp';

export function resolveNodes(globs: ResolvedGlob[], options: ParsedAutoRouterOptions) {
  const nodes = globs.map(glob => resolveNode(glob, options));

  const filteredNodes = filterConflictNodes(nodes);

  const customNodes = resolveCustomNode(options);

  const result = [...filteredNodes, ...customNodes];

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
  const preStat = await getTempNode(cwd);
  const preStatInodes = Object.values(preStat);

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
      const oldNodeName = Object.entries(preStat).find(([_, ino]) => ino === inode)?.[0];

      if (oldNodeName && oldNodeName !== name) {
        info.rename.push({ ...node, oldNodeName });
      }
    }
  });

  return info;
}

export function resolveNode(resolvedGlob: ResolvedGlob, options: ParsedAutoRouterOptions) {
  const { getRouteName, getRouteLayout, routeLayoutMap, routeLazy } = options;

  const resolvedPath = resolveGlobPath(resolvedGlob, options.pageExtension);

  let node: AutoRouterNode = {
    ...resolvedGlob,
    path: resolvedPath,
    get name() {
      return getRouteName(node);
    },
    originPath: resolvedPath,
    get component() {
      return node.name;
    },
    get layout() {
      return getRouteLayout(node, routeLayoutMap);
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

  return node;
}

function resolveCustomNode(options: ParsedAutoRouterOptions) {
  const { customRoute, notFoundRouteComponent, defaultCustomRouteComponent, getRouteLayout, routeLayoutMap } = options;

  const nodes: AutoRouterNode[] = [];

  Object.entries(customRoute).forEach(([name, path]) => {
    let component = defaultCustomRouteComponent;

    if (name === ROOT_ROUTE_NAME) {
      component = '';
    }

    if (name === NOT_FOUND_ROUTE_NAME) {
      component = notFoundRouteComponent;
    }

    let node: AutoRouterNode = {
      name,
      path,
      originPath: '',
      component: name === ROOT_ROUTE_NAME ? '' : component,
      get layout() {
        if (name === ROOT_ROUTE_NAME) {
          return '';
        }

        return getRouteLayout(node, routeLayoutMap);
      },
      importName: '',
      isLazy: false,
      isCustom: true,
      pageDir: '',
      glob: '',
      filePath: '',
      importPath: '',
      inode: NO_FILE_INODE
    };

    node = resolveParamNode(node);

    nodes.push(node);
  });

  return nodes;
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
  const optional = getOptionalParamsByPath(node.path);
  if (optional?.params) {
    node.params = { ...node.params, ...optional.params };
    node.path = optional.path;
  }

  if (!optional) {
    const required = getParamsByPath(node.path);
    if (required?.params) {
      node.params = { ...node.params, ...required.params };
      node.path = required.path;
    }
  }

  return node;
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
