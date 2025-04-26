import process from 'node:process';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { ensureFile } from '../shared';
import type { AutoRouterNode } from '../types';

const TEMP_DIR = '.temp';
const GIT_IGNORE = '.gitignore';
const TEMP_NODES = '.nodes-stat.json';

export async function initTempNodes() {
  const tempNodesDir = path.resolve(process.cwd(), TEMP_DIR);
  await ensureFile(tempNodesDir);
  const tempNodesPath = path.resolve(tempNodesDir, TEMP_NODES);

  if (!existsSync(tempNodesPath)) {
    await writeFile(tempNodesPath, '{}');
  }

  const gitIgnorePath = path.resolve(process.cwd(), GIT_IGNORE);

  if (!existsSync(gitIgnorePath)) {
    await writeFile(gitIgnorePath, '');
  }

  const gitIgnoreContent = await readFile(gitIgnorePath, 'utf-8');

  if (!gitIgnoreContent.includes(TEMP_DIR)) {
    const content = `${gitIgnoreContent}\n${TEMP_DIR}`;

    await writeFile(gitIgnorePath, content);
  }
}

export async function getTempNodes() {
  const tempNodesPath = path.resolve(process.cwd(), TEMP_DIR, TEMP_NODES);

  const content = await readFile(tempNodesPath, 'utf-8');

  let stat: Record<string, number> = {};

  try {
    stat = JSON.parse(content);
  } catch {
    stat = {};
  }

  return stat;
}

export async function updateTempNodes(nodes: AutoRouterNode[]) {
  const tempNodesPath = path.resolve(process.cwd(), TEMP_DIR, TEMP_NODES);
  await ensureFile(tempNodesPath);

  const stat: Record<string, number> = {};

  for (const node of nodes) {
    const name = node.name;
    const inode = node.inode;

    stat[name] = inode;
  }

  const content = JSON.stringify(stat, null, 2);

  await writeFile(tempNodesPath, content);
}
