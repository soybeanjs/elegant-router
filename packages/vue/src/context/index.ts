import ElegantRouter from '@elegant-router/core';
import type { ViteDevServer } from 'vite';
import { createPluginOptions } from './options';
import { genDtsFile } from './dts';
import { genImportsFile } from './imports';
import { genConstFile } from './const';
import { log } from './log';
import type { ElegantVueRouterOption } from '../types';

export default class ElegantVueRouter {
  options: ElegantVueRouterOption;

  erCtx: ElegantRouter;

  viteServer?: ViteDevServer;

  constructor(options: Partial<ElegantVueRouterOption> = {}) {
    this.erCtx = new ElegantRouter(options);

    this.options = createPluginOptions(this.erCtx.options, options);

    this.generate();

    this.setupFSWatcher();
  }

  scanPages() {
    this.erCtx.scanPages();
  }

  setupFSWatcher() {
    this.erCtx.setupFSWatcher(async () => {
      log('The pages changed, regenerating the dts file and routes...', 'info', this.options.log);

      await this.generate();

      log('The dts file and routes have been regenerated successfully', 'success', this.options.log);

      this.reloadViteServer();
    });
  }

  stopFSWatcher() {
    this.erCtx.stopFSWatcher();
  }

  setViteServer(server: ViteDevServer) {
    this.viteServer = server;
  }

  reloadViteServer() {
    this.viteServer?.ws?.send({ type: 'full-reload', path: '*' });
  }

  async generate() {
    await genDtsFile(this.erCtx.files, this.erCtx.entries, this.options);
    await genImportsFile(this.erCtx.files, this.options);
    await genConstFile(this.erCtx.trees, this.options);
  }
}
