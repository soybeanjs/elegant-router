import path from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { ensureFile } from '../shared';
import type { AutoRouterNode } from '../types';

const TEMP_DIR = '.temp';
const GIT_IGNORE = '.gitignore';
const TEMP_NODE = '.node-stat.json';

function getTempNodePath(cwd: string) {
  return path.resolve(cwd, TEMP_DIR, TEMP_NODE);
}

function getGitIgnorePath(cwd: string) {
  return path.resolve(cwd, GIT_IGNORE);
}

export async function initTempNode(cwd: string) {
  const tempNodePath = getTempNodePath(cwd);
  if (!existsSync(tempNodePath)) {
    await ensureFile(tempNodePath);
    await writeFile(tempNodePath, '{}');
  }

  const gitIgnorePath = getGitIgnorePath(cwd);

  if (!existsSync(gitIgnorePath)) {
    await writeFile(gitIgnorePath, '');
  }

  const gitIgnoreContent = await readFile(gitIgnorePath, 'utf-8');

  if (!gitIgnoreContent.includes(TEMP_DIR)) {
    const content = `${gitIgnoreContent}\n${TEMP_DIR}`;

    await writeFile(gitIgnorePath, content);
  }
}

export async function getTempNode(cwd: string) {
  const tempNodePath = getTempNodePath(cwd);

  const content = await readFile(tempNodePath, 'utf-8');

  let stat: Record<string, number> = {};

  try {
    stat = JSON.parse(content);
  } catch {
    stat = {};
  }

  return stat;
}

export async function updateTempNode(cwd: string, nodes: AutoRouterNode[]) {
  const tempNodePath = getTempNodePath(cwd);
  await ensureFile(tempNodePath);

  const stat: Record<string, number> = {};

  for (const node of nodes) {
    const name = node.name;
    const inode = node.inode;

    stat[name] = inode;
  }

  const content = JSON.stringify(stat, null, 2);

  await writeFile(tempNodePath, content);
}
