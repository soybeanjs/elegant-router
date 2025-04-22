import type { AutoRouterNode, RequiredAutoRouterOptions, ResolvedGlob } from '../types';

export function resolveNode(resolvedGlob: ResolvedGlob, options: RequiredAutoRouterOptions) {
  const path = resolvePath(resolvedGlob);

  let node: AutoRouterNode = {
    ...resolvedGlob,
    path,
    get name() {
      return options.getRouteName(this);
    },
    originPath: path,
    get layout() {
      return options.getRouteLayout(this, options.layouts);
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

  const GROUP_REG = /^\/(.*)\/(.*)$/;

  const match = path.match(GROUP_REG);

  if (match) {
    const [, group, name] = path.split('/');
    node.group = group.slice(1, -1);
    node.path = `/${name}`;
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

  let params: Record<string, boolean> | null = null;

  // 可选参数（一个或多个） 例如：/[[id]]/[[userId]], /edit_[[id]]_[[userId]], /edit-[[id]]-[[userId]]
  const OPTIONAL_PARAM_REG = /\[\[(\w+)\]\]/g;

  const match = path.match(OPTIONAL_PARAM_REG);

  if (match) {
    params = {};
    match.forEach(item => {
      const param = item.slice(2, -2);
      params![param] = true;
    });
    // 将path转换成 例如：/[[id]]/[[userId]] => /:id?/:userId?, /edit_[[id]]_[[userId]] => /edit/:id?/:userId?, /edit-[[id]]-[[userId]] => /edit-:id?-:userId?
    node.path = path.replace(OPTIONAL_PARAM_REG, ':$1?');
    node.path = path.replace(/_:/g, '/:');
  }

  if (params) {
    node.params = params;
  }

  return node;
}
