import { unlink } from 'node:fs/promises';
import enquirer from 'enquirer';
import type { Expression, StringLiteral } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';
import { CLI_CONFIG_SOURCE } from '../constants';
import { AutoRouter } from '../core';
import { logger } from '../shared';
import type { CliOptions } from '../types';
import { getCliConfigSourceFile } from './add-custom-route';

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

      if (node.isCustom) {
        message = `${message} (custom)`;
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

  if (findNode.isCustom) {
    if (!configPath) {
      logger.error(
        `the config file is not found, please add the config file ${CLI_CONFIG_SOURCE}.{js,ts,mjs,mts} 【配置文件未找到，请添加配置文件 ${CLI_CONFIG_SOURCE}.{js,ts,mjs,mts}】`
      );
      return;
    }

    try {
      await removeCustomRouteFromConfig(configPath, findNode.originPath);
    } catch (error) {
      logger.error(`Failed to update config file: ${error} 【更新配置文件失败】`);
    }
  } else {
    // Delete the route file
    await unlink(findNode.filePath);
  }

  autoRouter.updateOptions({
    customRoutes: autoRouter.getOptions().customRoutes.filter(route => route !== findNode.originPath)
  });

  await autoRouter.generate();

  logger.success(`the route ${routeName} has been deleted 【路由 ${routeName} 已删除】`);
}

async function removeCustomRouteFromConfig(configPath: string, routePath: string) {
  const { sourceFile, configObject } = await getCliConfigSourceFile(configPath);

  const customRoutesProp = configObject.getProperty('customRoutes');
  if (!customRoutesProp?.isKind(SyntaxKind.PropertyAssignment)) {
    return;
  }

  const customRoutesArray = customRoutesProp.getInitializer();
  if (!customRoutesArray?.isKind(SyntaxKind.ArrayLiteralExpression)) {
    return;
  }

  // Get existing routes
  const elements = customRoutesArray.getElements();
  const routeToRemove = elements.find(
    (el: Expression) => el.isKind(SyntaxKind.StringLiteral) && (el as StringLiteral).getLiteralValue() === routePath
  );

  if (routeToRemove) {
    customRoutesArray.removeElement(routeToRemove);

    await sourceFile.save();
    logger.success(
      `the custom route ${routePath} has been removed from config file 【自定义路由 ${routePath} 已从配置文件中移除】`
    );
  }
}
