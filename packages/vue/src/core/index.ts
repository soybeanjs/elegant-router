import ElegantRouter from '@elegant-router/core';
import type { ViteDevServer } from 'vite';
import { createPluginOptions } from './options';
import { genDtsFile } from './dts';
import { genImportsFile } from './imports';
import { genConstFile } from './const';
import { genTransformFile } from './transform';
import { log } from './log';
import type { ElegantVueRouterOption } from '../types';

export default class ElegantVueRouter {
  options: ElegantVueRouterOption;

  elegantRouter: ElegantRouter;

  viteServer?: ViteDevServer;

  constructor(options: Partial<ElegantVueRouterOption> = {}) {
    this.elegantRouter = new ElegantRouter(options);

    this.options = createPluginOptions(this.elegantRouter.options, options);

    genTransformFile(this.options, this.elegantRouter.entries);

    this.generate();
  }

  scanPages() {
    this.elegantRouter.scanPages();
  }

  setupFSWatcher() {
    this.elegantRouter.setupFSWatcher(async () => {
      log('The pages changed, regenerating the dts file and routes...', 'info', this.options.log);

      await this.generate();

      log('The dts file and routes have been regenerated successfully', 'success', this.options.log);

      this.reloadViteServer();
    });
  }

  stopFSWatcher() {
    this.elegantRouter.stopFSWatcher();
  }

  setViteServer(server: ViteDevServer) {
    this.viteServer = server;
  }

  reloadViteServer() {
    this.viteServer?.ws?.send({ type: 'full-reload', path: '*' });
  }

  async generate() {
    const { files, entries, trees } = this.elegantRouter;

    await genDtsFile(files, entries, this.options);
    await genImportsFile(files, this.options);
    await genConstFile(trees, this.options);
  }
}
