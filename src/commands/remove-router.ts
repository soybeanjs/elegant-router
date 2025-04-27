import { unlink } from 'node:fs/promises';
import enquirer from 'enquirer';
import { AutoRouter } from '../core';
import { logger } from '../shared';
import type { CliOptions } from '../types';

interface RemoveRouterPrompt {
  routeName: string;
}

export async function removeRouter(options: CliOptions) {
  const autoRouter = new AutoRouter(options);

  await autoRouter.generate();

  const result = await enquirer.prompt<RemoveRouterPrompt>({
    type: 'select',
    name: 'routeName',
    message: 'please select the route name to remove 【选择要删除的路由名称】',
    choices: autoRouter.nodes.map(node => node.name)
  });

  const { routeName } = result;

  const findNode = autoRouter.nodes.find(node => node.name === routeName);

  if (!findNode) {
    throw new Error(`the route ${routeName} not found`);
  }

  await unlink(findNode.filePath);

  await autoRouter.generate();

  logger.success(`the route ${routeName} has been removed`);
}
