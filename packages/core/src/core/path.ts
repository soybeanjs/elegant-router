import path from 'node:path';

export function getFullPathOfPageGlob(glob: string, pageDir: string, cwd: string) {
  return path.posix.join(cwd, pageDir, glob);
}
