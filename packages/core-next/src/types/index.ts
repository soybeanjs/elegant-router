export type MaybeArray<T> = T | T[];

export interface ResolvedGlob {
  cwd: string;
  glob: string;
}

export interface AutoRouterNode extends ResolvedGlob {
  path: string;
  name: string;
  originPath: string;
  group: string;
  layout: string;
  params: Record<string, boolean>;
}

export interface AutoRouterOptions {
  cwd?: string;
  pageDir?: MaybeArray<string>;
  pageInclude?: MaybeArray<string>;
  pageExclude?: MaybeArray<string>;
  dts?: string;
  tsconfig?: string;
  routerDir?: string;
  layouts?: Record<string, string>;
  layoutLazy?: (layout: string) => boolean;
  getRoutePath?: (node: AutoRouterNode) => string;
  getRouteName?: (node: AutoRouterNode) => string;
  getRouteLayout?: (node: AutoRouterNode, layouts: Record<string, string>) => string;
  routeLazy?: (node: AutoRouterNode) => boolean;
}

export type RequiredAutoRouterOptions = Required<AutoRouterOptions>;
