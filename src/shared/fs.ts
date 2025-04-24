import path from 'node:path';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';

/**
 * ensure file, if not exist, create it
 *
 * @param filepath
 */
export async function ensureFile(filepath: string) {
  const exist = existsSync(filepath);

  if (!exist) {
    await mkdir(path.dirname(filepath), { recursive: true });
  }
}
