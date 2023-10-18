export interface ElegantRouterOption {
  /**
   * the root directory of the project
   * @default process.cwd()
   */
  cwd: string;
  /**
   * the relative path to the root directory of the pages
   * @default "src/views"
   */
  pageDir: string;
  /**
   * alias
   * @description it can be used for the page and layout file import path
   * @default
   * ```ts
   * { "@": "src" }
   * ```
   */
  alias: Record<string, string>;
  /**
   * the patterns to match the page files
   * @default ["**‍/index.vue", "**‍/[[]*[]].vue"]
   * @example "index.vue", "[id.vue]"
   * @link the detail syntax: https://github.com/micromatch/micromatch
   */
  pagePatterns: string[];
  /**
   * the patterns to exclude the page files
   * @default ["**‍/components/**"]
   * @example "components/a/index.vue"
   */
  pageExcludePatterns: string[];
  /**
   * transform the route name
   * @param routeName the route name
   * @default
   * ```ts
   * routeName => routeName
   * ```
   */
  routeNameTransformer: (routeName: string) => string;
  /**
   * transform the route path
   * @param transformedName the transformed route name
   * @param path the route path
   * @default
   * ```ts
   * (_transformedName, path) => path
   * ```
   */
  routePathTransformer: (transformedName: string, path: string) => string;
  /**
   * show log
   * @default true
   */
  log: boolean;
}

export interface ElegantRouterFile {
  /**
   * the glob of the page
   */
  glob: string;
  /**
   * the full path of the page
   */
  fullPath: string;
  /**
   * the import path of the page file
   * @description
   * - the path is relative to the root directory of the project
   * - if set alias for the page directory, the path will be relative to the alias
   */
  importPath: string;
  /**
   * the route name transformed from the glob
   * @description
   * - transform the path splitter "/" of the glob to the underline "_"
   * - if the glob is start with "_", this part will be ignored
   * - if the glob contains uppercase letters, it will be transformed to lowercase letters
   * - if the glob is like "demo/[id].vue", the "[id]" will be transformed to param "id" of the route
   * @example
   * "a/b/c" => "a_b_c"
   * "a/b/[id]" => "a_b", the id will be recognized as the param of the route
   * "a/b_c/d" => "a_b_c_d"
   * "_a/b_c/d" => "b_c_d", because "_a" start with "_", so it does not appear in the route name
   */
  routeName: string;
  /**
   * the route path transformed from the glob
   * @description
   * - transform the underline "_" to the path splitter "/"
   * - if the glob is like "demo/[id].vue", the "[id]" will be transformed to ":id" of the route path
   * @example
   * "a/b/c" => "/a/b/c"
   * "a/b_c/d" => "/a/b/c/d"
   * "a/b/[id]" => "/a/b/:id"
   */
  routePath: string;
  /**
   * the route param key of the route
   * @description if the glob is like "demo/[id].vue", "id" will be the param key of the route
   * @default ""
   */
  routeParamKey: string;
}

/**
 * the map of the route name and the route path
 * @description
 * Map<name, path>
 */
export type ElegantRouterNamePathMap = Map<string, string>;

/**
 * the map of the route path and the route name
 * @description sorted by the route name
 * @example
 * ["a", "/a"]
 */
export type ElegantRouterNamePathEntry = [string, string];

/**
 * the tree of the route
 */
export interface ElegantRouterTree {
  routeName: string;
  routePath: string;
  children?: ElegantRouterTree[];
}
