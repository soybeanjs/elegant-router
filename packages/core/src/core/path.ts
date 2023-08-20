import path from 'node:path';

export function getFullPathOfPageGlob(glob: string, pageDir: string, cwd: string) {
  return path.join(cwd, pageDir, glob);
}
