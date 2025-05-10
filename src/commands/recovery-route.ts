import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import enquirer from 'enquirer';
import { SyntaxKind } from 'ts-morph';
import { AutoRouter } from '../core';
import { getRouteSourceFile, getRouteStringPropertyValue, saveRouteSourceFile } from '../core/route';
import { addExcludeGlob, getRouteBackup, getRouteItemBackup, removeExcludeGlob } from '../core/temp';
import { logger } from '../shared';
import type { CliOptions } from '../types';
import { createTemplate } from './add-route';

interface RecoveryRoutePrompt {
  routeName: string;
}

export async function recoveryRoute(options: CliOptions) {
  const autoRouter = new AutoRouter(options);

  const resolvedOptions = autoRouter.getOptions();

  const { cwd, routerGeneratedDir } = resolvedOptions;

  const backup = await getRouteBackup(cwd);

  const routeNames = Object.keys(backup);

  const result = await enquirer.prompt<RecoveryRoutePrompt>({
    type: 'select',
    name: 'routeName',
    message: 'please select the deleted route to recovery 【选择要恢复的已删除路由】',
    choices: routeNames
  });

  const backupItem = await getRouteItemBackup(cwd, result.routeName);

  if (!backupItem) {
    logger.warn(`the route ${result.routeName} not found 【路由 ${result.routeName} 不存在】`);
    return;
  }

  const routesPath = path.posix.join(cwd, routerGeneratedDir, 'routes.ts');

  const { sourceFile, getRoutesExpression } = await getRouteSourceFile(routesPath);

  const excludeGlob = backupItem.filepath.replace(`${cwd}/`, '');

  await addExcludeGlob(cwd, excludeGlob);

  const template = createTemplate(backupItem.filepath, result.routeName);

  await writeFile(backupItem.filepath, template, 'utf-8');

  await autoRouter.generate();

  await removeExcludeGlob(cwd, excludeGlob);

  await sourceFile.refreshFromFileSystem();

  const routesExpression = getRoutesExpression();

  const routeElement = routesExpression
    .getElements()
    .find(el => getRouteStringPropertyValue(el, 'name') === result.routeName);

  if (!routeElement?.isKind(SyntaxKind.ObjectLiteralExpression)) return;

  routeElement.replaceWithText(backupItem.routeCode);

  routeElement.formatText({ indentSize: 2 });

  await saveRouteSourceFile(sourceFile, routesExpression);

  logger.success(`the route ${result.routeName} has been recovered 【路由 ${result.routeName} 已恢复】`);
}
