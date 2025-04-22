import type { AutoRouterNode, AutoRouterParamType, RequiredAutoRouterOptions, ResolvedGlob } from '../types';

export function resolveNodes(globs: ResolvedGlob[], options: RequiredAutoRouterOptions) {
  return globs.map(glob => resolveNode(glob, options));
}

function resolveNode(resolvedGlob: ResolvedGlob, options: RequiredAutoRouterOptions) {
  const path = resolvePath(resolvedGlob);

  let node: AutoRouterNode = {
    ...resolvedGlob,
    path,
    get name() {
      return options.getRouteName(node);
    },
    originPath: path,
    get layout() {
      return options.getRouteLayout(node, options.layouts);
    }
  };

  node = resolveGroupNode(node);
  node = resolveParamNode(node);

  return node;
}

function resolvePath(resolvedGlob: ResolvedGlob) {
  const { glob } = resolvedGlob;

  let path = glob;
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  if (path.endsWith('.vue')) {
    path = path.replace(/\.vue$/, '');
  }

  if (path.endsWith('/index')) {
    path = path.replace(/\/index$/, '');
  }

  return path;
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
  const { path } = node;

  const GROUP_REG = /\/\((\w+)\)\//;

  const match = path.match(GROUP_REG);

  if (match) {
    const [matchItem, group] = match;
    node.group = group;
    node.path = path.replace(matchItem, '/');
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
  const { path } = node;

  const optional = getOptionalParamsByPath(path);
  if (optional?.params) {
    node.params = { ...node.params, ...optional.params };
    node.path = optional.path;
  }

  if (!optional) {
    const required = getParamsByPath(path);
    if (required?.params) {
      node.params = { ...node.params, ...required.params };
      node.path = required.path;
    }
  }

  return node;
}

function getOptionalParamsByPath(path: string) {
  const OPTIONAL_PARAM_REG = /\[\[(\w+)\]\]/g;

  const match = path.match(OPTIONAL_PARAM_REG);

  if (!match) {
    return null;
  }

  const params: Record<string, AutoRouterParamType> = {};
  let formatPath = path;

  match.forEach(item => {
    const param = item.slice(2, -2);
    params[param] = 'optional';
  });

  formatPath = path.replace(OPTIONAL_PARAM_REG, ':$1?');
  formatPath = formatPath.replace(/_:/g, '/:');

  const BETWEEN_REG = /\/:\w+\??\w+\/:/;
  formatPath = formatPath.replace(BETWEEN_REG, item => item.replace('_', '/'));

  return { params, path: formatPath };
}

function getParamsByPath(path: string) {
  const PARAM_REG = /\[(\w+)\]/g;

  const match = path.match(PARAM_REG);

  if (!match) {
    return null;
  }

  const params: Record<string, AutoRouterParamType> = {};

  let formatPath = path;

  match.forEach(item => {
    const param = item.slice(1, -1);
    params[param] = 'required';
  });

  formatPath = path.replace(PARAM_REG, ':$1');
  formatPath = formatPath.replace(/_:/g, '/:');

  const BETWEEN_REG = /\/:\w+\??\w+\/:/;
  formatPath = formatPath.replace(BETWEEN_REG, item => item.replace('_', '/'));

  return { params, path: formatPath };
}
