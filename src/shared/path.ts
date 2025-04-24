export function resolveImportPath(filePath: string, alias: Record<string, string>) {
  let iPath = filePath;

  const aliasEntries = Object.entries(alias);

  aliasEntries.some(item => {
    const [a, dir] = item;
    const match = iPath.startsWith(dir);

    if (match) {
      iPath = iPath.replace(dir, a);
    }

    return match;
  });

  return iPath;
}
