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
}

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
   * the directory of the pages
   *
   * 页面目录
   *
   * @default "['src/pages', 'src/views']"
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
   * 类型声明文件路径
   *
   * @default 'src/typings/auto-router.d.ts'
   */
  dts?: string;
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
   * the directory of the router
   *
   * 路由目录
   *
   * @default 'src/router/auto-router'
   */
  routerDir?: string;
  /**
   * the layouts of the router
   *
   * 路由布局
   *
   * @default "{ base: 'src/layouts/base/index.vue' }"
   */
  layouts?: Record<string, string>;
  /**
   * the lazy of the layout
   *
   * 布局懒加载
   *
   * @default false
   */
  layoutLazy?: (layout: string) => boolean;
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
  getRouteLayout?: (node: AutoRouterNode, layouts: Record<string, string>) => string;
  /**
   * the lazy of the route
   *
   * 路由懒加载
   *
   * @default true
   */
  routeLazy?: (node: AutoRouterNode) => boolean;
}

export type RequiredAutoRouterOptions = Required<AutoRouterOptions>;
