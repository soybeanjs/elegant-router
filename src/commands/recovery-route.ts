import path from 'node:path';
import enquirer from 'enquirer';
import { IndentationText, Project, SyntaxKind } from 'ts-morph';
import { AutoRouter } from '../core';
import { getRawCodeByElements, sortElements } from '../core/route';
import { getRoutesBackup, removeRoutesBackup } from '../core/temp';
import { logger } from '../shared';
import type { CliOptions } from '../types';

interface RecoveryRoutePrompt {
  routeName: string;
}

export async function recoveryRoute(options: CliOptions) {
  const autoRouter = new AutoRouter(options);

  const resolvedOptions = autoRouter.getOptions();

  const { cwd, routerGeneratedDir } = resolvedOptions;

  const backup = await getRoutesBackup(cwd);

  const routeNames = Object.keys(backup);

  const result = await enquirer.prompt<RecoveryRoutePrompt>({
    type: 'select',
    name: 'routeName',
    message: 'please select the deleted route to recovery 【选择要恢复的已删除路由】',
    choices: routeNames
  });

  const recoveryItem = backup[result.routeName] || '';

  if (!recoveryItem) {
    logger.warn(`the route ${result.routeName} not found 【路由 ${result.routeName} 不存在】`);
    return;
  }

  const routesPath = path.posix.join(cwd, routerGeneratedDir, 'routes.ts');

  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      useTrailingCommas: false
    }
  });

  const sourceFile = project.addSourceFileAtPath(routesPath);

  const routes = sourceFile.getVariableDeclaration('routes');

  if (!routes) {
    logger.error('routes.ts content is not valid 【文件routes.ts内容不合法，请直接删除重新生成】');
    return;
  }

  const initializer = routes.getInitializer();

  if (!initializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
    logger.error('routes.ts content is not valid 【文件routes.ts内容不合法，请直接删除重新生成】');
    return;
  }

  const routesExpression = initializer.asKindOrThrow(SyntaxKind.ArrayLiteralExpression);

  const index = routesExpression.getElements().findIndex(el => el.getText() === recoveryItem);

  if (index !== -1) {
    logger.warn(
      `the route ${result.routeName} already exists, skip recovery 【路由 ${result.routeName} 已存在， 无需恢复】`
    );

    await removeRoutesBackup(cwd, result.routeName);
    return;
  }

  routesExpression.addElement(recoveryItem);

  const sortedElements = sortElements(routesExpression.getElements());
  const code = getRawCodeByElements(sortedElements);

  routesExpression.replaceWithText(`[${code}\n]`);

  await sourceFile.save();

  logger.success(`the route ${result.routeName} has been recovered 【路由 ${result.routeName} 已恢复】`);
}
