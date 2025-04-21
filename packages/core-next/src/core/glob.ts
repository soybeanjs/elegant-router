import path from 'node:path';
import { globSync } from 'tinyglobby';
import type { RequiredAutoRouterOptions, ResolvedGlob } from '../types';

export function resolveGlobs(options: RequiredAutoRouterOptions) {
  const { cwd, pageDir, pageInclude, pageExclude } = options;

  const pageDirs = (Array.isArray(pageDir) ? pageDir : [pageDir]).map(dir => path.resolve(cwd, dir));

  const pageGlobs: ResolvedGlob[] = pageDirs.flatMap(dir => {
    const globs = globSync(pageInclude, {
      cwd: dir,
      onlyFiles: true,
      absolute: true,
      ignore: pageExclude
    });

    return globs.map(glob => ({
      cwd: dir,
      glob
    }));
  });

  return pageGlobs;
}
