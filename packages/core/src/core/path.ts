import path from 'node:path';

/**
 * get the full path of the page glob
 *
 * @param glob the page glob
 * @param pageDir the page dir
 * @param cwd the process root directory
 */
export function getFullPathOfPageGlob(glob: string, pageDir: string, cwd: string) {
  return path.posix.join(cwd, pageDir, glob);
}

/**
 * normalize the windows path
 *
 * @param windowsPath the windows path
 */
export function normalizeWindowsPath(windowsPath: string) {
  return windowsPath.replace(/\\/g, '/');
}
