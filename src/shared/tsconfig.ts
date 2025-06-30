import { readFileSync } from 'node:fs';
import path from 'node:path';
import { normalizePath } from 'unplugin-utils';
import stripJsonComments from 'strip-json-comments';

export function resolveAliasFromTsConfig(cwd: string, tsconfigPath: string = 'tsconfig.json') {
  const tsConfig = readFileSync(path.resolve(cwd, tsconfigPath), 'utf-8');

  let paths: Record<string, string[]> | undefined;

  try {
    paths = JSON.parse(stripJsonComments(tsConfig))?.compilerOptions?.paths;
  } catch {}

  const alias: Record<string, string> = {};

  Object.entries(paths ?? {}).forEach(([_key, value]) => {
    const key = _key.replace('/*', '');

    alias[key] = normalizePath(path.join(cwd, value[0].replace('/*', '')));
  });

  return alias;
}
