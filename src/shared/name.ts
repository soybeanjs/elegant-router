export function pascalCase(str: string) {
  return str.replace(/(^|[-_])(\w)/g, (_, __, char) => char.toUpperCase());
}

export function camelCase(str: string) {
  return str.replace(/(^|[-_])(\w)/g, (_, __, char) => char.toUpperCase());
}

export function kebabCase(str: string) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function getImportName(name: string) {
  const NUM_REG = /^\d+$/;

  let key = pascalCase(name);

  if (NUM_REG.test(name)) {
    key = `_${key}`;
  }

  return key;
}

export function transformPathToName(path: string) {
  const $path = path.replaceAll(':', '').replaceAll('?', '');

  return pascalCase($path.split('/').join('-'));
}
