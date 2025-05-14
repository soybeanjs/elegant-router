import type { RouteRecordRedirect, RouteRecordSingleView } from 'vue-router';

export type MaybeArray<T> = T | T[];

export interface ResolvedGlob {
  /**
   * the page directory
   *
   * 页面目录
   *
   * @default pageDir
   */
  pageDir: string;
  /**
   * the glob of the pages
   *
   * 页面 glob
   *
   * @default '**‍/*.vue'
   */
  glob: string;
  /**
   * the file path of the route
   *
   * 路由文件路径
   */
  filePath: string;
  /**
   * the import path of the route
   *
   * 路由导入路径
   */
  importPath: string;
  /**
   * the inode of the file
   *
   * 文件唯一标识
   */
  inode: number;
}

/**
 * the type of the route param
 *
 * 路由参数类型
 *
 * - optional: the param is optional, [[id]] 可选参数
 * - required: the param is required, [id] 必选参数
 */
export type AutoRouterParamType = 'optional' | 'required';

export interface AutoRouterNode extends ResolvedGlob {
  /**
   * the path of the route
   *
   * 路由路径
   *
   * @default transform the glob to the path
   */
  path: string;
  /**
   * the name of the route
   *
   * 路由名称
   *
   * @default transform the path to the route name
   */
  name: string;
  /**
   * the origin path of the route
   *
   * 路由原始路径
   */
  originPath: string;
  /**
   * the component of the route
   *
   * 路由组件
   */
  component: string;
  /**
   * the layout of the route
   *
   * 路由布局
   *
   * @default get the first key of the layouts
   */
  layout: string;
  /**
   * the group of the route
   *
   * 路由组
   *
   * @default ''
   */
  group?: string;
  /**
   * the params of the route
   *
   * 路由参数
   */
  params?: Record<string, AutoRouterParamType>;
  /**
   * the import name of the route
   *
   * 路由组件导入名称
   */
  importName: string;
  /**
   * the lazy of the route
   *
   * 路由懒加载
   */
  isLazy?: boolean;
  /**
   * the builtin of the route. (Root, NotFound)
   *
   * 内置路由 (Root, NotFound)
   */
  isBuiltin?: boolean;
  /**
   * the reuse of the route
   *
   * 复用路由
   */
  isReuse?: boolean;
}

interface RenamedNode extends AutoRouterNode {
  /**
   * the old node name
   *
   * 旧节点名称
   */
  oldNodeName: string;
}

export interface NodeItemBackup {
  filepath: string;
  inode: number;
}

export interface NodeStatInfo {
  add: AutoRouterNode[];
  rename: RenamedNode[];
}

export interface RouteItemBackup {
  filepath: string;
  routeCode: string;
}

export type RouteBackup = Record<string, RouteItemBackup>;

export interface AutoRouterOptions {
  /**
   * the root directory of the project
   *
   * 项目根目录
   *
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * whether to watch the file
   *
   * 是否监听文件
   *
   * @default true
   */
  watchFile?: boolean;
  /**
   * the duration of the file update
   *
   * 文件更新时间
   *
   * @default 500 ms
   */
  fileUpdateDuration?: number;
  /**
   * the directory of the pages
   *
   * 页面目录
   *
   * @default "['src/views']"
   */
  pageDir?: MaybeArray<string>;
  /**
   * the glob of the pages
   *
   * 页面 glob
   *
   * @default '**‍/*.vue'
   */
  pageInclude?: MaybeArray<string>;
  /**
   * the glob of the pages to exclude
   *
   * 页面 glob 排除
   *
   * @default ['**‍/components/**', '**‍/modules/**']
   */
  pageExclude?: MaybeArray<string>;
  /**
   * the path of the dts file
   *
   * 生成的路由类型声明文件路径
   *
   * @default 'src/typings/elegant-router.d.ts'
   */
  dts?: string;
  /**
   * the path of the vue-router dts file
   *
   * vue-router 类型声明文件路径
   *
   * @default 'src/typings/typed-router.d.ts'
   */
  vueRouterDts?: string;
  /**
   * the path of the tsconfig file
   *
   * tsconfig 文件路径
   *
   * @default 'tsconfig.json'
   */
  tsconfig?: string;
  /**
   * the alias of the project
   *
   * 项目别名
   *
   * @default 'get the alias from the tsconfig'
   */
  alias?: Record<string, string>;
  /**
   * the directory of the router generated
   *
   * 路由自动生成的目录
   *
   * @default 'src/router/_generated'
   */
  routerGeneratedDir?: string;
  /**
   * the layouts of the router
   *
   * 路由布局
   *
   * @default "{
   *  base: 'src/layouts/base/index.vue',
   *  blank: 'src/layouts/blank/index.vue',
   * }"
   */
  layouts?: Record<string, string>;
  /**
   * the lazy of the layout
   *
   * 布局懒加载
   *
   * @default true
   */
  layoutLazy?: (layout: string) => boolean;
  /**
   * the routes to reuse
   *
   * 复用已存在文件的路由
   *
   * @example
   *   ['/reuse1', '/reuse2/:id', '/reuse3/:id?/:name?'];
   */
  reuseRoutes?: string[];
  /**
   * the default component of the reuse route
   *
   * 复用路由的默认组件
   *
   * @default 'Wip'
   */
  defaultReuseRouteComponent?: string;
  /**
   * the root redirect path
   *
   * 根路由重定向路径
   *
   * @default '/home'
   */
  rootRedirect?: string;
  /**
   * the not found route component
   *
   * 404 路由组件
   *
   * @default '404'
   */
  notFoundRouteComponent?: string;
  /**
   * the path of the route
   *
   * 路由路径
   *
   * @default 'src/router/auto-router'
   */
  getRoutePath?: (node: AutoRouterNode) => string;
  /**
   * the name of the route
   *
   * 路由名称
   *
   * @default transform the path to the route name
   */
  getRouteName?: (node: AutoRouterNode) => string;
  /**
   * the layout of the route
   *
   * 路由布局
   *
   * @default get the first key of the layouts
   */
  getRouteLayout?: (node: AutoRouterNode) => string;
  /**
   * the lazy of the route
   *
   * 路由懒加载
   *
   * @default true
   */
  routeLazy?: (node: AutoRouterNode) => boolean;
  /**
   * the function to generate the meta of the route
   *
   * 生成路由的 meta 函数, 只会覆盖不存在的 meta 属性
   *
   * @example
   *   ```ts
   *     getRouteMeta: (node) => {
   *       return {
   *         title: node.name
   *       }
   *     }
   *   ```;
   */
  getRouteMeta?: (node: AutoRouterNode) => Record<string, any> | null;
}

export type CliOptions = Omit<AutoRouterOptions, 'watchFile' | 'fileUpdateDuration'>;

export type PluginOptions = Omit<AutoRouterOptions, 'reuseRoutes'>;

export interface NormalizedLayout {
  /**
   * the name of the layout
   *
   * 布局名称
   */
  name: string;
  /**
   * the import name of the layout
   *
   * 布局组件导入名称
   */
  importName: string;
  /**
   * the import path of the layout
   *
   * 布局导入路径
   */
  importPath: string;
  /**
   * the lazy of the layout
   *
   * 布局懒加载
   */
  isLazy: boolean;
}

export type ParsedAutoRouterOptions = Omit<Required<AutoRouterOptions>, 'layouts' | 'layoutLazy'> & {
  pageExtension: string[];
  layouts: NormalizedLayout[];
};

export interface AutoRouterSingleView extends Omit<RouteRecordSingleView, 'component'> {
  component: string;
  layout: string;
}

export interface AutoRouterRedirect extends RouteRecordRedirect {
  layout: string;
}

export type AutoRouterRoute = AutoRouterSingleView | AutoRouterRedirect;
