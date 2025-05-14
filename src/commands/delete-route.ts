import { unlink } from 'node:fs/promises';
import enquirer from 'enquirer';
import type { Expression, StringLiteral } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';
import { CLI_CONFIG_SOURCE } from '../constants';
import { AutoRouter } from '../core';
import { logger } from '../shared';
import type { CliOptions } from '../types';
import { getCliConfigSourceFile } from './add-reuse-route';

interface DeleteRoutePrompt {
  routeName: string;
}

export async function deleteRoute(options: CliOptions, configPath?: string) {
  const autoRouter = new AutoRouter(options);

  await autoRouter.generate();

  const result = await enquirer.prompt<DeleteRoutePrompt>({
    type: 'select',
    name: 'routeName',
    message: 'please select the route to delete 【选择要删除的路由】',
    choices: autoRouter.getConfigurableNodes().map(node => {
      let message = node.name;

      if (node.isReuse) {
        message = `${message} (reuse)`;
      }

      return {
        name: node.name,
        message
      };
    })
  });

  const { routeName } = result;

  const findNode = autoRouter.nodes.find(node => node.name === routeName);

  if (!findNode) {
    logger.warn(`the route ${routeName} not found 【路由 ${routeName} 不存在】`);
    return;
  }

  if (findNode.isReuse) {
    if (!configPath) {
      logger.error(
        `the config file is not found, please add the config file ${CLI_CONFIG_SOURCE}.{js,ts,mjs,mts} 【配置文件未找到，请添加配置文件 ${CLI_CONFIG_SOURCE}.{js,ts,mjs,mts}】`
      );
      return;
    }

    try {
      await removeReuseRouteFromConfig(configPath, findNode.originPath);
    } catch (error) {
      logger.error(`Failed to update config file: ${error} 【更新配置文件失败】`);
    }
  } else {
    // Delete the route file
    await unlink(findNode.filePath);
  }

  autoRouter.updateOptions({
    reuseRoutes: autoRouter.getOptions().reuseRoutes.filter(route => route !== findNode.originPath)
  });

  await autoRouter.generate();

  logger.success(`the route ${routeName} has been deleted 【路由 ${routeName} 已删除】`);
}

async function removeReuseRouteFromConfig(configPath: string, routePath: string) {
  const { sourceFile, configObject } = await getCliConfigSourceFile(configPath);

  const reuseRoutesProp = configObject.getProperty('reuseRoutes');
  if (!reuseRoutesProp?.isKind(SyntaxKind.PropertyAssignment)) {
    return;
  }

  const reuseRoutesArray = reuseRoutesProp.getInitializer();
  if (!reuseRoutesArray?.isKind(SyntaxKind.ArrayLiteralExpression)) {
    return;
  }

  // Get existing routes
  const elements = reuseRoutesArray.getElements();
  const routeToRemove = elements.find(
    (el: Expression) => el.isKind(SyntaxKind.StringLiteral) && (el as StringLiteral).getLiteralValue() === routePath
  );

  if (routeToRemove) {
    reuseRoutesArray.removeElement(routeToRemove);

    await sourceFile.save();
    logger.success(
      `the reuse route ${routePath} has been removed from config file 【复用路由 ${routePath} 已从配置文件中移除】`
    );
  }
}
