import path from 'node:path';
import { stat } from 'node:fs/promises';
import { globSync } from 'tinyglobby';
import { normalizePath, resolveImportPath } from '../shared';
import type { ParsedAutoRouterOptions, ResolvedGlob } from '../types';

export async function resolveGlobs(options: ParsedAutoRouterOptions) {
  const { cwd, pageDir, pageInclude, pageExclude } = options;

  const pageDirs = Array.isArray(pageDir) ? pageDir : [pageDir];

  const pageGlobs = pageDirs.flatMap(dir => {
    const $pageDir = path.resolve(cwd, dir);

    const globs = globSync(pageInclude, {
      cwd: $pageDir,
      onlyFiles: true,
      ignore: pageExclude
    });

    return globs.map(glob => resolveGlob(glob, dir, options));
  });

  const globs: ResolvedGlob[] = await Promise.all(
    pageGlobs.map(async glob => {
      const info = await stat(glob.filePath);

      return {
        ...glob,
        inode: info.ino
      };
    })
  );

  return globs;
}

export function resolveGlob(glob: string, pageDir: string, options: Pick<ParsedAutoRouterOptions, 'cwd' | 'alias'>) {
  const { cwd, alias } = options;

  const $pageDir = path.resolve(cwd, pageDir);

  const filePath = path.resolve($pageDir, glob);
  const importPath = resolveImportPath(filePath, alias);

  const resolvedGlob: Omit<ResolvedGlob, 'inode'> = {
    pageDir,
    glob: normalizePath(glob),
    filePath,
    importPath
  };

  return resolvedGlob as ResolvedGlob;
}
