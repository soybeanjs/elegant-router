// import { writeFile } from 'node:fs/promises';
import type { AutoRouterNode, AutoRouterOptions, RequiredAutoRouterOptions, ResolvedGlob } from '../types';
import { resolveOptions } from './option';
import { resolveGlobs } from './glob';
import { resolveNodes } from './node';

export class AutoRouter {
  private options: RequiredAutoRouterOptions = {} as RequiredAutoRouterOptions;

  globs: ResolvedGlob[] = [];

  nodes: AutoRouterNode[] = [];

  constructor() {
    this.init();
  }

  async init(options?: AutoRouterOptions) {
    this.options = await resolveOptions(options);
    this.globs = resolveGlobs(this.options);
    this.nodes = resolveNodes(this.globs, this.options);

    // writeFile('test/globs.json', JSON.stringify(this.globs, null, 2));
    // writeFile('test/nodes.json', JSON.stringify(this.nodes, null, 2));
  }
}
