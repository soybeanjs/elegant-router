import type { ElegentRouterOption } from '../types';

/**
 * create the plugin options
 * @param options the plugin options
 */
export function createPluginOptions(options?: Partial<ElegentRouterOption>): ElegentRouterOption {
  const PAGE_DIR = 'src/views';
  const PAGE_PATTERNS = ['**/index.{vue,tsx,jsx}', '**/[[]*[]].{vue,tsx,jsx}'];
  const PAGE_EXCLUDE_PATTERNS = ['**/components/**'];

  const opts: ElegentRouterOption = {
    cwd: process.cwd(),
    pageDir: PAGE_DIR,
    pageDirAlias: PAGE_DIR.replace('src/', '@/'),
    pagePatterns: PAGE_PATTERNS,
    pageExcludePatterns: PAGE_EXCLUDE_PATTERNS,
    routeNameTansformer: name => name,
    routePathTansformer: (_transformedName, path) => path,
    log: true,
    ...options
  };

  return opts;
}
