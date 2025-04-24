import process from 'node:process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function resolveAliasFromTsConfig(cwd: string = process.cwd(), tsconfigPath: string = 'tsconfig.json') {
  const tsConfig = await readFile(path.resolve(cwd, tsconfigPath), 'utf-8');

  let paths: Record<string, string[]> | undefined;

  try {
    paths = JSON.parse(tsConfig)?.compilerOptions?.paths;
  } catch {}

  const alias: Record<string, string> = {};

  Object.entries(paths ?? {}).forEach(([_key, value]) => {
    const key = _key.replace('/*', '');

    alias[key] = path.join(cwd, value[0].replace('/*', ''));
  });

  return alias;
}
