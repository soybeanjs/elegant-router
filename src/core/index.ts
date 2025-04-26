import type { ViteDevServer } from 'vite';
import type { AutoRouterNode, AutoRouterOptions, NodeStatInfo, ParsedAutoRouterOptions, ResolvedGlob } from '../types';
import { resolveOptions } from './option';
import { initTempNodes, updateTempNodes } from './temp';
import { getNodeStatInfo, resolveNodes } from './node';
import { generateImportsFile } from './import';
import { generateDtsFile } from './dts';
import { generateRoutes } from './route';
import { resolveGlobs } from './glob';
import { FileWatcher } from './watcher';

export class AutoRouter {
  private options: ParsedAutoRouterOptions = {} as ParsedAutoRouterOptions;

  globs: ResolvedGlob[] = [];

  nodes: AutoRouterNode[] = [];

  statInfo: NodeStatInfo = {
    add: [],
    rename: []
  };

  watcher?: FileWatcher;

  viteServer?: ViteDevServer;

  constructor(options?: AutoRouterOptions) {
    this.init(options);
  }

  async init(options?: AutoRouterOptions) {
    this.options = await resolveOptions(options);
    this.watcher = new FileWatcher(this.options);
    await this.generate();
    if (this.options.watchFile) {
      await this.watch();
    }
  }

  async generate() {
    this.globs = await resolveGlobs(this.options);
    this.nodes = resolveNodes(this.globs, this.options);

    await initTempNodes();
    this.statInfo = await getNodeStatInfo(this.nodes);

    await generateDtsFile(this.nodes, this.options);
    await generateImportsFile(this.nodes, this.options);
    await generateRoutes(this.nodes, this.statInfo, this.options);

    await updateTempNodes(this.nodes);
  }

  async watch() {
    this.watcher?.start(async () => {
      await this.generate();
    });
  }

  stopWatch() {
    this.watcher?.close();
  }

  setViteServer(server: ViteDevServer) {
    this.viteServer = server;

    this.viteServer.httpServer?.on('close', () => {
      this.stopWatch();
    });
  }

  reloadViteServer() {
    this.viteServer?.ws?.send({ type: 'full-reload', path: '*' });
  }
}
