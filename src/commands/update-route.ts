import path from 'node:path';
import { SyntaxKind } from 'ts-morph';
import enquirer from 'enquirer';
import { AutoRouter } from '../core';
import { getRouteSourceFile, getRouteStringPropertyValue, saveRouteSourceFile } from '../core/route';
import { logger, updateStringProperty } from '../shared';
import type { CliOptions } from '../types';

interface UpdateRoutePrompt {
  routeName: string;
  property: string;
}

interface UpdateRouteComponentPrompt {
  component: string;
}

interface UpdateRouteLayoutPrompt {
  layout: string;
}

export async function updateRoute(options: CliOptions) {
  const autoRouter = new AutoRouter(options);

  const resolvedOptions = autoRouter.getOptions();
  await autoRouter.generate();

  const { cwd, routerGeneratedDir } = resolvedOptions;
  const configurableNodes = autoRouter.getConfigurableNodes();

  const routesPath = path.posix.join(cwd, routerGeneratedDir, 'routes.ts');

  const { sourceFile, getRoutesExpression } = await getRouteSourceFile(routesPath);

  const routeExpression = getRoutesExpression();

  const routeNames = routeExpression
    .getElements()
    .map(route => getRouteStringPropertyValue(route, 'name'))
    .filter(Boolean) as string[];

  const properties = ['component', 'layout'];

  const result = await enquirer.prompt<UpdateRoutePrompt>([
    {
      type: 'select',
      name: 'routeName',
      message: 'please select the route to update 【选择要更新的路由】',
      choices: configurableNodes
        .filter(node => routeNames.includes(node.name))
        .map(node => {
          let message = node.name;

          if (node.isReuse) {
            message = `${message} (reuse)`;
          }

          return {
            name: node.name,
            message
          };
        })
    },
    {
      type: 'select',
      name: 'property',
      message: 'please select the property to update 【选择要更新的属性】',
      choices: properties
    }
  ]);

  const routeElement = routeExpression
    .getElements()
    .find(el => getRouteStringPropertyValue(el, 'name') === result.routeName);

  if (!routeElement?.isKind(SyntaxKind.ObjectLiteralExpression)) return;

  if (result.property === 'component') {
    const findNode = autoRouter.nodes.find(item => item.name === result.routeName);

    if (!findNode) {
      logger.warn(`the route ${result.routeName} not found 【路由 ${result.routeName} 不存在】`);
      return;
    }

    if (findNode.filePath) {
      logger.warn(
        `the route ${result.routeName} is a route with file, can't update the component 【路由 ${result.routeName} 是文件路由，不能更新组件】`
      );
      return;
    }

    const oldComponent = getRouteStringPropertyValue(routeElement, 'component');

    const componentResult = await enquirer.prompt<UpdateRouteComponentPrompt>({
      type: 'select',
      name: 'component',
      message: `please select the new component.(old value is ${oldComponent}) 【选择新的组件，旧值为 ${oldComponent}】`,
      choices: autoRouter.nodes.filter(item => item.filePath).map(item => item.name)
    });

    const { component } = componentResult;

    // 更新路由名称
    updateStringProperty(routeElement, 'component', component);
  } else {
    const oldLayout = getRouteStringPropertyValue(routeElement, 'layout');

    const layoutResult = await enquirer.prompt<UpdateRouteLayoutPrompt>({
      type: 'select',
      name: 'layout',
      message: `please select the new layout.(old value is ${oldLayout}) 【选择新的布局，旧值为 ${oldLayout}】`,
      choices: resolvedOptions.layouts.map(item => item.name)
    });

    const { layout } = layoutResult;

    // 更新路由名称
    updateStringProperty(routeElement, 'layout', layout);
  }

  await saveRouteSourceFile(sourceFile, routeExpression);
}
