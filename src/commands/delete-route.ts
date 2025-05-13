import { unlink } from 'node:fs/promises';
import enquirer from 'enquirer';
import { AutoRouter } from '../core';
import { logger } from '../shared';
import type { CliOptions } from '../types';

interface DeleteRoutePrompt {
  routeName: string;
}

export async function deleteRoute(options: CliOptions) {
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

  await unlink(findNode.filePath);

  await autoRouter.generate();

  logger.success(`the route ${routeName} has been deleted 【路由 ${routeName} 已删除】`);
}
