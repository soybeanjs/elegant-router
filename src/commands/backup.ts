import enquirer from 'enquirer';
import { AutoRouter } from '../core';
import { getRouteBackup, removeRouteBackup } from '../core/temp';
import type { CliOptions } from '../types';
import { logger } from '../shared';

interface BackupManagePrompt {
  action: 'list' | 'delete';
  routeName: string;
}

export async function manageBackup(options: CliOptions) {
  const autoRouter = new AutoRouter(options);

  const resolvedOptions = autoRouter.getOptions();

  const backup = await getRouteBackup(resolvedOptions.cwd);

  if (Object.keys(backup).length === 0) {
    logger.info(
      'no route backup found, the backup will be added when the route was deleted 【没有找到路由备份，路由删除时会自动添加备份】'
    );
    return;
  }

  const result = await enquirer.prompt<BackupManagePrompt>({
    type: 'select',
    name: 'action',
    message: 'please select the action 【选择操作】',
    choices: [
      {
        name: 'list',
        message: 'list all routes backup 【列出路由备份】'
      },
      {
        name: 'delete',
        message: 'delete route backup 【删除路由备份】'
      }
    ]
  });

  if (result.action === 'list') {
    const listResult = await enquirer.prompt<BackupManagePrompt>({
      type: 'select',
      name: 'routeName',
      message: 'please select the route to delete 【选择路由备份查看详情】',
      choices: Object.keys(backup)
    });

    const routeBackup = backup[listResult.routeName];

    logger.info(`\n${routeBackup.routeCode}`);
  } else if (result.action === 'delete') {
    const deleteResult = await enquirer.prompt<BackupManagePrompt>({
      type: 'select',
      name: 'routeName',
      message: 'please select the route to delete 【选择路由备份查看详情】',
      choices: Object.keys(backup)
    });

    await removeRouteBackup(resolvedOptions.cwd, deleteResult.routeName);

    logger.success(
      `the route ${deleteResult.routeName} backup has been deleted 【路由备份 ${deleteResult.routeName} 已删除】`
    );
  }
}
