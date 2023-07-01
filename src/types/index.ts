export interface ElegentRouterOption {
  /**
   * the root directory of the project
   * @default process.cwd()
   */
  cwd: string;
  /**
   * the relative path to the directory of the pages
   * @default "src/views"
   */
  pageDir: string;
  /**
   * the alias of the directory of the pages
   * @description it will be used to generate the page file import path
   * @default "@/views"
   */
  pageDirAlias: string;
  /**
   * the patterns to match the page files
   * @default ["**‍/index.{vue,tsx,jsx}", "**‍/[[]*[]].{vue,tsx,jsx}"]
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
   * @param name
   */
  routeNameTansformer: (name: string) => string;
}

export interface ElegentRouterItem {
  /**
   * the glob of the page
   */
  glob: string;
  /**
   * the full path of the page
   */
  fullpath: string;
  /**
   * the import path of the page file
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
