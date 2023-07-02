import path from 'path';

export function getFullpathOfPageGlob(glob: string, pageDir: string, cwd: string) {
  return path.join(cwd, pageDir, glob);
}
