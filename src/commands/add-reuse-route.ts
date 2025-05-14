import path from 'node:path';
import enquirer from 'enquirer';
import type { Node, ObjectLiteralExpression } from 'ts-morph';
import { IndentationText, Project, SyntaxKind } from 'ts-morph';
import { AutoRouter } from '../core';
import { getRouteSourceFile, getRouteStringPropertyValue, saveRouteSourceFile } from '../core/route';
import { logger, updateStringProperty } from '../shared';
import { CLI_CONFIG_SOURCE } from '../constants';
import type { CliOptions } from '../types';

interface AddReuseRoutePrompt {
  cPath: string;
  layout: string;
  component: string;
}

export async function addReuseRoute(options: CliOptions, configPath?: string) {
  if (!configPath) {
    logger.error(
      `the config file is not found, please add the config file ${CLI_CONFIG_SOURCE}.{js,ts,mjs,mts} 【配置文件未找到，请添加配置文件 ${CLI_CONFIG_SOURCE}.{js,ts,mjs,mts}】`
    );
    return;
  }

  const autoRouter = new AutoRouter(options);

  const resolvedOptions = autoRouter.getOptions();
  await autoRouter.generate();

  const { cwd, routerGeneratedDir } = resolvedOptions;

  const result = await enquirer.prompt<AddReuseRoutePrompt>([
    {
      type: 'input',
      name: 'cPath',
      message: 'please input the path of the reuse route, like `/demo`\n 【输入复用路由的路径，如：/demo】'
    },
    {
      type: 'select',
      name: 'layout',
      message: 'please select the layout of the reuse route 【选择路由布局】',
      choices: resolvedOptions.layouts.map(layout => layout.name)
    },
    {
      type: 'select',
      name: 'component',
      message: 'please select the component of the reuse route 【选择路由组件】',
      choices: autoRouter.nodes.filter(item => item.filePath).map(item => item.name)
    }
  ]);

  const { cPath, layout, component } = result;

  autoRouter.updateOptions({
    reuseRoutes: resolvedOptions.reuseRoutes.concat(cPath)
  });

  await autoRouter.generate();

  const node = autoRouter.nodes.find(item => item.originPath === cPath);

  if (!node) {
    logger.warn(`the reuse route ${cPath} not found 【复用路由 ${cPath} 不存在】`);
    return;
  }

  const routesPath = path.posix.join(cwd, routerGeneratedDir, 'routes.ts');

  const { sourceFile, getRoutesExpression } = await getRouteSourceFile(routesPath);

  const routesExpression = getRoutesExpression();

  const routeElement = routesExpression.getElements().find(el => getRouteStringPropertyValue(el, 'name') === node.name);

  if (!routeElement?.isKind(SyntaxKind.ObjectLiteralExpression)) return;

  updateStringProperty(routeElement, 'layout', layout);

  updateStringProperty(routeElement, 'component', component);

  await saveRouteSourceFile(sourceFile, routesExpression);

  // Update config file
  const { sourceFile: configSourceFile, configObject } = await getCliConfigSourceFile(configPath);

  if (!configObject?.isKind(SyntaxKind.ObjectLiteralExpression)) {
    logger.error('Invalid config file format 【配置文件格式无效】');
    return;
  }

  try {
    await updateConfigReuseRoutes(configObject, cPath);
    await configSourceFile.save();
    logger.success(`the reuse route ${cPath} has been added 【复用路由 ${cPath} 已添加】`);
  } catch (error) {
    logger.error(`Failed to update config file: ${error} 【更新配置文件失败】`);
  }
}

async function updateConfigReuseRoutes(configObject: ObjectLiteralExpression, newRoute: string) {
  const reuseRoutesProp = configObject.getProperty('reuseRoutes');

  if (!reuseRoutesProp) {
    // Create new reuseRoutes property if it doesn't exist
    configObject.addPropertyAssignment({
      name: 'reuseRoutes',
      initializer: `['${newRoute}']`
    });
    return;
  }

  if (!reuseRoutesProp.isKind(SyntaxKind.PropertyAssignment)) {
    throw new Error('reuseRoutes property is not a property assignment');
  }

  const reuseRoutesArray = reuseRoutesProp.getInitializer();
  if (!reuseRoutesArray?.isKind(SyntaxKind.ArrayLiteralExpression)) {
    throw new Error('reuseRoutes property is not an array');
  }

  // Get existing routes
  const existingRoutes = reuseRoutesArray
    .getElements()
    .map((el: Node) => (el.isKind(SyntaxKind.StringLiteral) ? el.getLiteralValue() : ''))
    .filter(Boolean);

  // Add new route if it doesn't exist
  if (!existingRoutes.includes(newRoute)) {
    reuseRoutesArray.addElement(`'${newRoute}'`);
  }
}

export async function getCliConfigSourceFile(configPath: string) {
  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      useTrailingCommas: false
    }
  });

  const sourceFile = project.addSourceFileAtPath(configPath);

  // Get the default export
  const defaultExport = sourceFile.getExportAssignment(d => d.isExportEquals() === false);
  if (!defaultExport) {
    throw new Error('Config file must have a default export 【配置文件必须有一个默认导出】');
  }

  // Get the defineConfig call expression
  const defineConfigCall = defaultExport.getExpression();
  if (!defineConfigCall?.isKind(SyntaxKind.CallExpression)) {
    throw new Error('Default export must be a defineConfig call 【默认导出必须是一个 defineConfig 调用】');
  }

  // Get the config object from defineConfig argument
  const configObject = defineConfigCall.getArguments()[0];
  if (!configObject?.isKind(SyntaxKind.ObjectLiteralExpression)) {
    throw new Error('defineConfig argument must be an object literal 【defineConfig 的参数必须是一个对象字面量】');
  }

  return {
    sourceFile,
    configObject
  };
}
