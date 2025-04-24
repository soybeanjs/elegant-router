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
  isLazy: boolean;
  /**
   * the custom of the route
   *
   * 自定义路由
   */
  isCustom?: boolean;
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
   * @default "{ base: 'src/layouts/base/index.vue' }"
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
   * the custom route (format: { name: path })
   *
   * 自定义路由 (格式: { name: path })
   *
   * @default
   * "{
   *   "Root": "/",
   *   "NotFound": "/:pathMatch(.*)*"
   * }"
   */
  customRoute?: Record<string, string>;
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
}

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
  layouts: NormalizedLayout[];
};
