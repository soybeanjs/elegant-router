import type { AutoRouterOptions, RequiredAutoRouterOptions, ResolvedGlob } from '../types';
import { resolveOptions } from './option';
import { resolveGlobs } from './glob';

export class AutoRouter {
  private options: RequiredAutoRouterOptions;

  globs: ResolvedGlob[];

  constructor(options: AutoRouterOptions) {
    this.options = resolveOptions(options);
    this.globs = resolveGlobs(this.options);
  }
}
