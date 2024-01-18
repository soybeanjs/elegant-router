import process from 'node:process';
import type { ElegantRouterOption } from '../types';
import { normalizeWindowsPath } from './path';

/**
 * create the plugin options
 *
 * @param options the plugin options
 */
export function createPluginOptions(options?: Partial<ElegantRouterOption>): ElegantRouterOption {
  const PAGE_DIR = 'src/views';
  const PAGE_PATTERNS = ['**/index.vue', '**/[[]*[]].vue'];
  const PAGE_EXCLUDE_PATTERNS = ['**/components/**'];

  const opts: ElegantRouterOption = {
    cwd: process.cwd(),
    pageDir: PAGE_DIR,
    alias: {
      '@': 'src'
    },
    pagePatterns: PAGE_PATTERNS,
    pageExcludePatterns: PAGE_EXCLUDE_PATTERNS,
    routeNameTransformer: name => name,
    routePathTransformer: (_transformedName, path) => path,
    log: true,
    ...options
  };

  // normalize the path if it is windows
  opts.cwd = normalizeWindowsPath(opts.cwd);

  return opts;
}
