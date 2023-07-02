export async function createFs() {
  const fsExtra = await import('fs-extra');

  return fsExtra;
}
