import { createPluginOptions } from './options';
import type { ElegentRouterOption, ElegentRouterItem } from '../types';
import { getGlobs } from '../shared/glob';
import { handleValidatePageGlob } from './validate';
import { getFullpathOfPageGlob } from './path';
import { transformPageGlobToElegentRouterItem } from './transform';

/**
 * the class of the plugin
 */
export default class ElegentRouter {
  options: ElegentRouterOption;

  pageGlobs: string[] = [];

  items: ElegentRouterItem[] = [];

  constructor(options: Partial<ElegentRouterOption> = {}) {
    this.options = createPluginOptions(options);
    this.search();
  }

  /**
   * search the pages
   */
  search() {
    this.getPageGlobs();
    this.getItems();
  }

  /**
   * get the valid page globs
   */
  getPageGlobs() {
    const { cwd, pagePatterns, pageExcludePatterns, pageDir } = this.options;

    const globs = getGlobs(pagePatterns, pageExcludePatterns, pageDir);

    const pageGlobs = globs.filter(glob => {
      const fullGlob = getFullpathOfPageGlob(glob, pageDir, cwd);

      return handleValidatePageGlob(glob, fullGlob);
    });

    this.pageGlobs = pageGlobs;
  }

  /**
   * get the items of the plugin
   */
  getItems() {
    const items = this.pageGlobs.map(glob => transformPageGlobToElegentRouterItem(glob, this.options));
    this.items = items;
  }
}
