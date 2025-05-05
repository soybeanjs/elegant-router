import path from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { ensureFile } from '../shared';
import type { AutoRouterNode, RouteBackup, RouteItemBackup } from '../types';

const TEMP_DIR = '.temp';
const GIT_IGNORE = '.gitignore';
const NODE_STATE = '.node-stat.json';
const ROUTES_BACKUP = '.routes-backup.json';

export async function initTemp(cwd: string) {
  await initTempNode(cwd);
  await initGitIgnore(cwd);
  await initRouteBackup(cwd);
}

async function initTempNode(cwd: string) {
  const tempNodePath = getTempNodePath(cwd);

  if (existsSync(tempNodePath)) return;

  await ensureFile(tempNodePath);
  await writeFile(tempNodePath, '{}');
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

async function initRouteBackup(cwd: string) {
  const routesBackupPath = getRouteBackupPath(cwd);
  if (existsSync(routesBackupPath)) return;

  await ensureFile(routesBackupPath);
  await writeFile(routesBackupPath, '{}');
}

export async function getRouteBackup(cwd: string) {
  const routesBackupPath = getRouteBackupPath(cwd);

  let backup: RouteBackup = {};

  try {
    const content = await readFile(routesBackupPath, 'utf-8');
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

export async function updateRouteBackup(cwd: string, routes: RouteBackup) {
  await initRouteBackup(cwd);

  const backup = await getRouteBackup(cwd);
  Object.assign(backup, routes);

  await writeRouteBackup(cwd, backup);
}

export async function removeRouteBackup(cwd: string, routeName: string) {
  const backup = await getRouteBackup(cwd);

  if (!backup[routeName]) return;

  const { [routeName]: _, ...newBackup } = backup;

  await writeRouteBackup(cwd, newBackup);
}

async function writeRouteBackup(cwd: string, backup: RouteBackup) {
  const routesBackupPath = getRouteBackupPath(cwd);
  const content = JSON.stringify(backup, null, 2);
  await writeFile(routesBackupPath, content);
}

function getTempNodePath(cwd: string) {
  return path.resolve(cwd, TEMP_DIR, NODE_STATE);
}

function getGitIgnorePath(cwd: string) {
  return path.resolve(cwd, GIT_IGNORE);
}

function getRouteBackupPath(cwd: string) {
  return path.resolve(cwd, TEMP_DIR, ROUTES_BACKUP);
}
