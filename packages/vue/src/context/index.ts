import ElegentRouter from '@elegent-router/core';
import type { ViteDevServer } from 'vite';
import { createPluginOptions } from './options';
import { genDtsFile } from './dts';
import { genImportsFile } from './imports';
import { log } from './log';
import type { ElegentVueRouterOption } from '../types';

export default class ElegentVueRouter {
  options: ElegentVueRouterOption;

  erCtx: ElegentRouter;

  viteServer?: ViteDevServer;

  constructor(options: Partial<ElegentVueRouterOption> = {}) {
    this.erCtx = new ElegentRouter(options);

    this.options = createPluginOptions(this.erCtx.options, options);

    this.generate();

    this.setuFSWatcher();
  }

  scanPages() {
    this.erCtx.scanPages();
  }

  setuFSWatcher() {
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
  }
}
