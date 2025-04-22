export function pascalCase(str: string) {
  return str.replace(/(^|[-_])(\w)/g, (_, __, char) => char.toUpperCase());
}

export function camelCase(str: string) {
  return str.replace(/(^|[-_])(\w)/g, (_, __, char) => char.toUpperCase());
}

export function kebabCase(str: string) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}
