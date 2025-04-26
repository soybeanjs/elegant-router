import path from 'node:path';
import { stat } from 'node:fs/promises';
import { globSync } from 'tinyglobby';
import { resolveImportPath } from '../shared';
import type { ParsedAutoRouterOptions, ResolvedGlob } from '../types';

export async function resolveGlobs(options: ParsedAutoRouterOptions) {
  const { cwd, pageDir, pageInclude, pageExclude, alias } = options;

  const pageDirs = Array.isArray(pageDir) ? pageDir : [pageDir];

  const pageGlobs = pageDirs.flatMap(dir => {
    const $pageDir = path.resolve(cwd, dir);

    const globs = globSync(pageInclude, {
      cwd: $pageDir,
      onlyFiles: true,
      ignore: pageExclude
    });

    const result = globs.map(glob => {
      const filePath = path.resolve($pageDir, glob);
      const importPath = resolveImportPath(filePath, alias);

      return {
        pageDir: dir,
        glob,
        filePath,
        importPath
      };
    });

    return result;
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
