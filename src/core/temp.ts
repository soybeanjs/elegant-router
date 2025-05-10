import path from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { ensureFile } from '../shared';
import type { AutoRouterNode, NodeItemBackup, RouteBackup, RouteItemBackup } from '../types';

const TEMP_DIR = '.temp';
const GIT_IGNORE = '.gitignore';
const NODE_BACKUP = '.node-backup.json';
const ROUTE_BACKUP = '.route-backup.json';
const EXCLUDE_GLOB = '.exclude-glob.json';

export async function initTemp(cwd: string) {
  await initGitIgnore(cwd);
  await initNodeBackup(cwd);
  await initRouteBackup(cwd);
  await initExcludeGlob(cwd);
}

async function initGitIgnore(cwd: string) {
  const gitIgnorePath = getGitIgnorePath(cwd);

  if (!existsSync(gitIgnorePath)) {
    await writeFile(gitIgnorePath, '');
  }

  const gitIgnoreContent = await readFile(gitIgnorePath, 'utf-8');
  if (gitIgnoreContent.includes(TEMP_DIR)) return;

  const content = `${gitIgnoreContent}\n${TEMP_DIR}`;
  await writeFile(gitIgnorePath, content);
}

async function initNodeBackup(cwd: string) {
  const nodeBackupPath = getNodeBackupPath(cwd);

  if (existsSync(nodeBackupPath)) return;

  await ensureFile(nodeBackupPath);
  await writeFile(nodeBackupPath, '{}');
}

export async function getNodeBackup(cwd: string) {
  const nodeBackupPath = getNodeBackupPath(cwd);

  const content = await readFile(nodeBackupPath, 'utf-8');

  let backup: Record<string, NodeItemBackup> = {};

  try {
    backup = JSON.parse(content);
  } catch {
    backup = {};
  }

  return backup;
}

export async function getNodeBackupItem(cwd: string, name: string): Promise<NodeItemBackup | null> {
  const backup = await getNodeBackup(cwd);

  return backup[name] || null;
}

export async function updateNodeBackup(cwd: string, nodes: AutoRouterNode[]) {
  const nodeBackupPath = getNodeBackupPath(cwd);
  await ensureFile(nodeBackupPath);

  const backup: Record<string, NodeItemBackup> = {};

  for (const node of nodes) {
    const name = node.name;
    const inode = node.inode;
    const filepath = node.filePath;

    backup[name] = {
      filepath,
      inode
    };
  }

  const content = JSON.stringify(backup, null, 2);

  await writeFile(nodeBackupPath, content);
}

async function initRouteBackup(cwd: string) {
  const routeBackupPath = getRouteBackupPath(cwd);
  if (existsSync(routeBackupPath)) return;

  await ensureFile(routeBackupPath);
  await writeFile(routeBackupPath, '{}');
}

export async function getRouteBackup(cwd: string) {
  const routeBackupPath = getRouteBackupPath(cwd);

  let backup: RouteBackup = {};

  try {
    const content = await readFile(routeBackupPath, 'utf-8');
    backup = JSON.parse(content);
  } catch {
    backup = {};
  }

  return backup;
}

export async function getRouteItemBackup(cwd: string, routeName: string): Promise<RouteItemBackup | null> {
  const backup = await getRouteBackup(cwd);

  return backup[routeName] || null;
}

export async function updateRouteBackup(cwd: string, routeBackup: RouteBackup) {
  await initRouteBackup(cwd);

  const backup = await getRouteBackup(cwd);
  Object.assign(backup, routeBackup);

  await writeRouteBackup(cwd, backup);
}

export async function removeRouteBackup(cwd: string, routeName: string) {
  const backup = await getRouteBackup(cwd);

  if (!backup[routeName]) return;

  const { [routeName]: _, ...newBackup } = backup;

  await writeRouteBackup(cwd, newBackup);
}

async function writeRouteBackup(cwd: string, backup: RouteBackup) {
  const routeBackupPath = getRouteBackupPath(cwd);
  const content = JSON.stringify(backup, null, 2);
  await writeFile(routeBackupPath, content);
}

function getNodeBackupPath(cwd: string) {
  return path.resolve(cwd, TEMP_DIR, NODE_BACKUP);
}

function getGitIgnorePath(cwd: string) {
  return path.resolve(cwd, GIT_IGNORE);
}

function getRouteBackupPath(cwd: string) {
  return path.resolve(cwd, TEMP_DIR, ROUTE_BACKUP);
}

async function initExcludeGlob(cwd: string) {
  const excludeGlobPath = getExcludeGlobPath(cwd);
  if (existsSync(excludeGlobPath)) return;

  await ensureFile(excludeGlobPath);
  await writeFile(excludeGlobPath, '[]');
}

export async function getExcludeGlob(cwd: string) {
  const excludeGlobPath = getExcludeGlobPath(cwd);

  let excludeGlobs: string[] = [];

  try {
    const content = await readFile(excludeGlobPath, 'utf-8');
    excludeGlobs = JSON.parse(content);
  } catch {
    excludeGlobs = [];
  }

  return excludeGlobs;
}

export async function addExcludeGlob(cwd: string, glob: string) {
  const excludeGlobs = await getExcludeGlob(cwd);
  excludeGlobs.push(glob);
  await writeFile(getExcludeGlobPath(cwd), JSON.stringify(excludeGlobs, null, 2));
}

export async function removeExcludeGlob(cwd: string, glob: string) {
  const excludeGlobs = await getExcludeGlob(cwd);
  const newExcludeGlobs = excludeGlobs.filter(g => g !== glob);
  await writeFile(getExcludeGlobPath(cwd), JSON.stringify(newExcludeGlobs, null, 2));
}

export async function resetExcludeGlob(cwd: string) {
  const excludeGlobPath = getExcludeGlobPath(cwd);
  await ensureFile(excludeGlobPath);
  await writeFile(excludeGlobPath, '[]');
}

export async function isInExcludeGlob(cwd: string, glob: string) {
  const excludeGlobs = await getExcludeGlob(cwd);
  return excludeGlobs.includes(glob);
}

function getExcludeGlobPath(cwd: string) {
  return path.resolve(cwd, TEMP_DIR, EXCLUDE_GLOB);
}
