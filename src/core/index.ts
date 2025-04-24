import type { AutoRouterNode, AutoRouterOptions, ParsedAutoRouterOptions, ResolvedGlob } from '../types';
import { resolveOptions } from './option';
import { resolveGlobs } from './glob';
import { resolveNodes } from './node';
import { generateImportsFile } from './import';
import { generateDtsFile } from './dts';

export class AutoRouter {
  private options: ParsedAutoRouterOptions = {} as ParsedAutoRouterOptions;

  globs: ResolvedGlob[] = [];

  nodes: AutoRouterNode[] = [];

  constructor(options?: AutoRouterOptions) {
    this.init(options);
  }

  async init(options?: AutoRouterOptions) {
    this.options = await resolveOptions(options);
    this.globs = resolveGlobs(this.options);
    this.nodes = resolveNodes(this.globs, this.options);

    await this.generate();
  }

  async generate() {
    await generateDtsFile(this.nodes, this.options);
    await generateImportsFile(this.nodes, this.options);
  }
}
