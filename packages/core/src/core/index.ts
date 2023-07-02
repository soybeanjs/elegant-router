import micromatch from 'micromatch';
import type { FSWatcher } from 'chokidar';
import { createPluginOptions } from './options';
import type {
  ElegentRouterOption,
  ElegentRouterFile,
  ElegentRouterNamePathMap,
  ElegentRouterNamePathEntry,
  ElegentRouterTree
} from '../types';
import { getGlobs } from '../shared/glob';
import { handleValidatePageGlob } from './validate';
import { getFullpathOfPageGlob } from './path';
import {
  transformPageGlobToRouterFile,
  transformRouterFilesToMaps,
  tranformRouterMapsToEntries,
  transformRouterEntriesToTrees
} from './transform';
import { setupWatcher } from './watcher';

/**
 * the class of the plugin
 */
export default class ElegentRouter {
  options: ElegentRouterOption;

  pageGlobs: string[] = [];

  files: ElegentRouterFile[] = [];

  maps: ElegentRouterNamePathMap = new Map<string, string>();

  entries: ElegentRouterNamePathEntry[] = [];

  trees: ElegentRouterTree[] = [];

  fsWatcher?: FSWatcher;

  constructor(options: Partial<ElegentRouterOption> = {}) {
    this.options = createPluginOptions(options);
    this.scanPages();
  }

  /**
   * scan the pages
   */
  scanPages() {
    this.getPageGlobs();
    this.getRouterContextProps();
  }

  /**
   * get the valid page globs
   */
  getPageGlobs() {
    const { pagePatterns, pageExcludePatterns, pageDir } = this.options;

    const globs = getGlobs(pagePatterns, pageExcludePatterns, pageDir);

    this.pageGlobs = this.filterValidPageGlobs(globs);
  }

  /**
   * filter the valid page globs
   * @param globs
   */
  filterValidPageGlobs(globs: string[], needMatch = false) {
    const { cwd, pageDir, pagePatterns, pageExcludePatterns } = this.options;

    return globs.filter(glob => {
      const fullGlob = getFullpathOfPageGlob(glob, pageDir, cwd);

      const isValid = handleValidatePageGlob(glob, fullGlob);

      const isMatch = !needMatch || micromatch.isMatch(glob, pagePatterns, { ignore: pageExcludePatterns });

      return isValid && isMatch;
    });
  }

  /**
   * get the router context props
   */
  getRouterContextProps() {
    this.files = this.pageGlobs.map(glob => transformPageGlobToRouterFile(glob, this.options));
    this.maps = transformRouterFilesToMaps(this.files, this.options);
    this.entries = tranformRouterMapsToEntries(this.maps);
    this.trees = transformRouterEntriesToTrees(this.entries, this.maps);
  }

  /**
   * setup the FS watcher
   * @param afterChange after change callback
   * @param beforeChange before change callback
   */
  setupFSWatcher(afterChange: () => void, beforeChange?: () => void) {
    const { pageDir, pageExcludePatterns } = this.options;

    this.fsWatcher = setupWatcher(
      pageDir,
      pageExcludePatterns,
      globs => {
        const updateGlobs = this.filterValidPageGlobs(globs, true);

        const needUpdate = updateGlobs.length > 0;

        if (needUpdate) {
          beforeChange?.();

          this.scanPages();

          afterChange();
        }
      },
      this.options.log
    );
  }

  /**
   * stop the FS watcher
   */
  stopFSWatcher() {
    this.fsWatcher?.close();
  }
}
