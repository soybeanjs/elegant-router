import { writeFile } from 'node:fs/promises';
import type { AutoRouterNode, AutoRouterOptions, RequiredAutoRouterOptions, ResolvedGlob } from '../types';
import globJson from '../../globs.json';
import { resolveOptions } from './option';
// import { resolveGlobs } from './glob';
import { resolveNodes } from './node';

export class AutoRouter {
  private options: RequiredAutoRouterOptions;

  globs: ResolvedGlob[];

  nodes: AutoRouterNode[];

  constructor(options?: AutoRouterOptions) {
    this.options = resolveOptions(options);
    // this.globs = resolveGlobs(this.options);
    this.globs = globJson;
    this.nodes = resolveNodes(this.globs, this.options);

    writeFile('nodes.json', JSON.stringify(this.nodes, null, 2));
  }
}
