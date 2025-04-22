import path from 'node:path';
import { globSync } from 'tinyglobby';
import type { RequiredAutoRouterOptions, ResolvedGlob } from '../types';

export function resolveGlobs(options: RequiredAutoRouterOptions) {
  const { cwd, pageDir, pageInclude, pageExclude, alias } = options;

  const pageDirs = Array.isArray(pageDir) ? pageDir : [pageDir];

  const pageGlobs = pageDirs.flatMap(dir => {
    const $pageDir = path.resolve(cwd, dir);

    const globs = globSync(pageInclude, {
      cwd: $pageDir,
      onlyFiles: true,
      ignore: pageExclude
    });

    const result: ResolvedGlob[] = globs.map(glob => {
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

  return pageGlobs;
}

function resolveImportPath(filePath: string, alias: Record<string, string>) {
  let iPath = filePath;

  const aliasEntries = Object.entries(alias);

  aliasEntries.some(item => {
    const [a, dir] = item;
    const match = iPath.startsWith(dir);

    if (match) {
      iPath = iPath.replace(dir, a);
    }

    return match;
  });

  return iPath;
}
