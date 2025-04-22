import process from 'node:process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function resolveTsConfigPaths(cwd: string = process.cwd(), tsconfigPath: string = 'tsconfig.json') {
  const tsConfig = await readFile(path.resolve(cwd, tsconfigPath), 'utf-8');

  let paths: Record<string, string[]> | undefined;

  try {
    paths = JSON.parse(tsConfig)?.compilerOptions?.paths;
  } catch {}

  const alias: Record<string, string> = {};

  Object.entries(paths ?? {}).forEach(([key, value]) => {
    alias[key] = path.join(cwd, value[0]);
  });

  return alias;
}

resolveTsConfigPaths();
