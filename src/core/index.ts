import type { ViteDevServer } from 'vite';
import type { AutoRouterNode, AutoRouterOptions, NodeStatInfo, ParsedAutoRouterOptions, ResolvedGlob } from '../types';
import { resolveOptions } from './option';
import { initTemp, updateTempNode } from './temp';
import { getNodeStatInfo, resolveNodes } from './node';
import { generateImportsFile } from './import';
import { generateDtsFile } from './dts';
import { generateRoutes } from './route';
import { resolveGlobs } from './glob';
import { FileWatcher } from './watcher';
import { generateSharedFile, generateTransformerFile } from './generate';

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

  constructor(options?: AutoRouterOptions, generate = false) {
    this.init(options, generate);
  }

  init(options?: AutoRouterOptions, generate = false) {
    this.options = resolveOptions(options);

    if (generate) {
      this.generate();
    }
  }

  getOptions() {
    return this.options;
  }

  updateOptions(options: Partial<ParsedAutoRouterOptions>) {
    this.options = Object.assign(this.options, options);
  }

  async initGlobs() {
    this.globs = await resolveGlobs(this.options);
  }

  async initNodes() {
    this.nodes = resolveNodes(this.globs, this.options);
  }

  async initStatInfo() {
    this.statInfo = await getNodeStatInfo(this.options.cwd, this.nodes);
  }

  async generate() {
    await initTemp(this.options.cwd);
    await this.initGlobs();
    await this.initNodes();
    await this.initStatInfo();

    await generateDtsFile(this.nodes, this.options);
    await generateImportsFile(this.nodes, this.options);
    await generateTransformerFile(this.options);
    await generateSharedFile(this.nodes, this.options);
    await generateRoutes(this.nodes, this.statInfo, this.options);

    await updateTempNode(this.options.cwd, this.nodes);
  }

  async watch() {
    this.watcher = new FileWatcher(this.options);
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
