import fg from 'fast-glob';

/**
 * get globs
 *
 * @param patterns the glob patterns
 * @param exclude the glob exclude patterns
 * @param matchDir the glob match directory
 */
export function getGlobs(patterns: string[], exclude: string[], matchDir: string) {
  const { sync } = fg;

  const globs = sync(patterns, {
    onlyFiles: true,
    cwd: matchDir,
    ignore: exclude
  });

  return globs.sort();
}
