import { createFilter } from 'unplugin-utils';
import chokidar from 'chokidar';
import type { FSWatcher } from 'chokidar';
import { logger } from '../shared';
import type { ParsedAutoRouterOptions } from '../types';

export class FileWatcher {
  private watcher: FSWatcher | undefined;
  private debounceTimer: NodeJS.Timeout | null = null;
  private pendingGlobs: Set<string> = new Set();

  updateDuration: number = 500;

  constructor(options: ParsedAutoRouterOptions) {
    this.init(options);
    this.updateDuration = options.fileUpdateDuration;
  }

  init(options: ParsedAutoRouterOptions) {
    const { cwd, pageDir, pageInclude, pageExclude } = options;

    const filter = createFilter(pageInclude, pageExclude);

    // 创建监听器
    this.watcher = chokidar.watch(pageDir, {
      cwd,
      ignoreInitial: true,
      ignored: (glob: string, stats) => {
        if (!stats?.isFile()) {
          return false;
        }

        const isMatch = filter(glob);

        return !isMatch;
      }
    });

    this.watcher?.on('ready', () => {
      logger.start('watcher ready');
    });
  }

  start(callback: (glob: string) => Promise<void>) {
    const debouncedCallback = async () => {
      if (this.pendingGlobs.size === 0) return;

      // Take the latest file for processing
      const latestGlob = Array.from(this.pendingGlobs).pop() as string;
      this.pendingGlobs.clear();

      await callback(latestGlob);
    };

    const handleFileEvent = (glob: string) => {
      this.pendingGlobs.add(glob);

      // Clear existing timer if it exists
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Set new timer
      this.debounceTimer = setTimeout(async () => {
        await debouncedCallback();
        this.debounceTimer = null;
      }, this.updateDuration);
    };

    this.watcher?.on('add', handleFileEvent);
    this.watcher?.on('unlink', handleFileEvent);
  }

  close() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.watcher?.close();
  }
}
