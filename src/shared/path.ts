import path from 'node:path';

/**
 * Normalize path to ensure forward slashes are used, compatible with different operating systems
 *
 * @param filePath - Path to be normalized
 * @returns Normalized path with forward slashes (/)
 */
export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Resolve import path, handle aliases and path separators, compatible with different operating systems
 *
 * @param filePath - File path
 * @param alias - Path alias configuration
 * @returns Processed import path
 */
export function resolveImportPath(filePath: string, alias: Record<string, string>) {
  // First normalize the path, convert all backslashes (\) to forward slashes (/)
  let iPath = normalizePath(filePath);

  const aliasEntries = Object.entries(alias);

  aliasEntries.some(item => {
    const [a, dir] = item;
    // Ensure directory path also uses forward slashes
    const normalizedDir = normalizePath(dir);
    const match = iPath.startsWith(normalizedDir);

    if (match) {
      iPath = iPath.replace(normalizedDir, a);
    }

    return match;
  });

  return iPath;
}

/**
 * Join path segments using posix format, ensuring paths use forward slashes (/)
 *
 * @param segments - Path segments
 * @returns Joined path with forward slashes (/)
 */
export function joinPath(...segments: string[]): string {
  // Use path.posix to ensure generated paths use forward slashes
  return path.posix.join(...segments.map(normalizePath));
}
