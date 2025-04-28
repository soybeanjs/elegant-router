import { normalizePath } from 'unplugin-utils';

export function resolveImportPath(filePath: string, alias: Record<string, string>) {
  let iPath = normalizePath(filePath);

  const aliasEntries = Object.entries(alias);

  aliasEntries.some(item => {
    const [a, dir] = item;
    const normalizeDir = normalizePath(dir);
    const match = iPath.startsWith(normalizeDir);

    if (match) {
      iPath = iPath.replace(normalizeDir, a);
    }

    return match;
  });

  const exts = ['.tsx', '.jsx'];

  const findExt = exts.find(ext => iPath.endsWith(ext));

  if (findExt) {
    iPath = iPath.replace(findExt, '');
  }

  return iPath;
}
