import path from 'node:path';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { IndentationText, Project, SyntaxKind } from 'ts-morph';
import type { ArrayLiteralExpression, Expression, SourceFile } from 'ts-morph';
import {
  createPrefixCommentOfGenFile,
  ensureFile,
  getObjectProperty,
  getStringProperty,
  updateStringProperty
} from '../shared';
import { ELEGANT_ROUTER_TYPES_MODULE_NAME, ROOT_ROUTE_NAME } from '../constants';
import type { AutoRouterNode, NodeStatInfo, ParsedAutoRouterOptions, RouteBackup } from '../types';
import { sortNodeName } from './node';
import { getNodeBackupItem, updateRouteBackup } from './temp';

export async function generateRoutes(
  nodes: AutoRouterNode[],
  statInfo: NodeStatInfo,
  options: ParsedAutoRouterOptions
) {
  const { cwd, routerGeneratedDir } = options;

  const routesPath = path.posix.join(cwd, routerGeneratedDir, 'routes.ts');
  await ensureFile(routesPath);

  if (!existsSync(routesPath)) {
    const code = await createInitRoutesCode();
    await writeFile(routesPath, code);

    await initRoutes(nodes, routesPath, options);

    return;
  }

  await updateRoutes(nodes, statInfo, routesPath, options);
}

async function initRoutes(nodes: AutoRouterNode[], routesPath: string, options: ParsedAutoRouterOptions) {
  const { sourceFile, getRoutesExpression } = await getRouteSourceFile(routesPath);

  const routesExpression = getRoutesExpression();

  const code = await createRoutesCodeByNodes(nodes, options);

  routesExpression.replaceWithText(code);

  await saveRouteSourceFile(sourceFile, routesExpression);
}

async function updateRoutes(
  nodes: AutoRouterNode[],
  statInfo: NodeStatInfo,
  routesPath: string,
  options: ParsedAutoRouterOptions
) {
  const { cwd, getRouteMeta } = options;
  const { sourceFile, getRoutesExpression } = await getRouteSourceFile(routesPath);

  const routesExpression = getRoutesExpression();

  const namePathMap = getNamePathMap(routesExpression.getElements());

  const { createdNames, deletedNames, updatedNames } = getRouteStatInfo(nodes, namePathMap, statInfo);

  if (createdNames.length > 0) {
    const createdRoutes = nodes.filter(node => createdNames.includes(node.name));

    createdRoutes.forEach(node => {
      const routeStr = createRouteString(node);

      routesExpression.addElement(routeStr);
    });
  }

  if (deletedNames.length > 0) {
    const routeBackup: RouteBackup = {};

    for await (const deletedName of deletedNames) {
      const elements = routesExpression.getElements();

      const index = elements.findIndex(el => getRouteStringPropertyValue(el, 'name') === deletedName);

      if (index === -1) continue;

      const routeElement = elements[index];

      let routeText = routeElement.getFullText();

      routesExpression.removeElement(index);

      const nodeBackupItem = await getNodeBackupItem(cwd, deletedName);

      if (!nodeBackupItem) continue;

      if (routeText.startsWith('\n')) {
        routeText = routeText.slice(1);
      }
      routeBackup[deletedName] = {
        filepath: nodeBackupItem.filepath,
        routeCode: routeText
      };
    }

    if (Object.keys(routeBackup).length > 0) {
      await updateRouteBackup(cwd, routeBackup);
    }
  }

  if (updatedNames.length > 0) {
    const updatedRoutes = nodes.filter(node => {
      return updatedNames.some(item => item.name === node.name);
    });

    updatedRoutes.forEach(node => {
      const oldName = updatedNames.find(item => item.name === node.name)?.oldName;

      const routeElement = routesExpression
        .getElements()
        .find(el => getRouteStringPropertyValue(el, 'name') === oldName);

      if (!routeElement?.isKind(SyntaxKind.ObjectLiteralExpression)) return;

      // 更新路由名称
      updateStringProperty(routeElement, 'name', node.name);

      // 更新路由路径
      updateStringProperty(routeElement, 'path', node.path);

      // 更新组件
      updateStringProperty(routeElement, 'component', node.component);

      // 更新布局
      updateStringProperty(routeElement, 'layout', node.layout);
    });
  }

  nodes.forEach(node => {
    const routeElement = routesExpression
      .getElements()
      .find(el => getRouteStringPropertyValue(el, 'name') === node.name);

    if (!routeElement?.isKind(SyntaxKind.ObjectLiteralExpression)) return;

    // 更新路由元信息
    updateMetaProperty(routeElement, getRouteMeta?.(node));
  });

  await saveRouteSourceFile(sourceFile, routesExpression);
}

export async function getRouteSourceFile(routesPath: string) {
  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      useTrailingCommas: false
    }
  });

  const sourceFile = project.addSourceFileAtPath(routesPath);

  function getRoutesExpression() {
    const routes = sourceFile.getVariableDeclaration('routes');

    const error = 'routes.ts content is not valid 【文件routes.ts内容不合法，请直接删除重新生成】';

    if (!routes) {
      throw new Error(error);
    }

    const initializer = routes.getInitializer();

    if (!initializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
      throw new Error(error);
    }

    return initializer.asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
  }

  return {
    sourceFile,
    getRoutesExpression
  };
}

export async function saveRouteSourceFile(sourceFile: SourceFile, routesExpression: ArrayLiteralExpression) {
  const sortedElements = sortElements(routesExpression.getElements());
  const code = getRawCodeByElements(sortedElements);

  routesExpression.replaceWithText(`[${code}\n]`);

  routesExpression.formatText({
    indentSize: 2
  });

  await sourceFile.save();
}

function getRouteStatInfo(nodes: AutoRouterNode[], namePathMap: Map<string, string>, statInfo: NodeStatInfo) {
  const nameNodeMap = new Map<string, AutoRouterNode>();

  nodes.forEach(node => {
    nameNodeMap.set(node.name, node);
  });

  const createdNames: string[] = [];
  const deletedNames: string[] = [];
  const updatedNames: { name: string; oldName: string }[] = [];

  statInfo.rename.forEach(rename => {
    const node = nameNodeMap.get(rename.name);

    if (node) {
      updatedNames.push({ name: node.name, oldName: rename.oldNodeName });
    }
  });

  nameNodeMap.forEach((_node, name) => {
    if (!namePathMap.has(name) && !statInfo.rename.some(item => item.name === name)) {
      createdNames.push(name);
    }
  });

  namePathMap.forEach((_path, name) => {
    if (!nameNodeMap.has(name) && !statInfo.rename.some(item => item.oldNodeName === name)) {
      deletedNames.push(name);
    }
  });

  return {
    createdNames,
    deletedNames,
    updatedNames
  };
}

async function createInitRoutesCode() {
  const preCode = createPrefixCommentOfGenFile();

  const code = `${preCode}

import type { AutoRouterRoute } from '${ELEGANT_ROUTER_TYPES_MODULE_NAME}';

export const routes: AutoRouterRoute[] = [];
`;

  return code;
}

async function createRoutesCodeByNodes(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const { rootRedirect, getRouteMeta } = options;

  const code = `[\n${nodes.map(node => createRouteString(node, rootRedirect, getRouteMeta)).join(',\n')}\n]`;

  return code;
}

function createRouteString(
  node: AutoRouterNode,
  rootRedirect?: string,
  getRouteMeta?: (node: AutoRouterNode) => Record<string, any> | null
) {
  let code = `{
    name: '${node.name}',
    path: '${node.path}',`;

  if (node.name === ROOT_ROUTE_NAME && rootRedirect) {
    code += `\nredirect: '${rootRedirect}',`;
  }

  if (node.layout) {
    code += `\nlayout: '${node.layout}',`;
  }

  if (node.component) {
    code += `\ncomponent: '${node.component}',`;
  }

  const meta = getRouteMeta?.(node);

  if (meta) {
    code += `\nmeta: ${createMetaString(meta)},`;
  }

  code += `\n}`;

  return code;
}

function createMetaString(meta: Record<string, any>) {
  return `{
    ${Object.entries(meta)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(',\n')}
  }`;
}

function updateMetaProperty(element: Expression, newMeta?: Record<string, any> | null) {
  if (!newMeta || Object.keys(newMeta).length === 0) return;
  if (!element.isKind(SyntaxKind.ObjectLiteralExpression)) return;

  const meta = getRouteMetaPropertyValue(element);

  if (meta === null) {
    element.addPropertyAssignment({
      name: 'meta',
      initializer: createMetaString(newMeta)
    });

    return;
  }

  if (!meta.isKind(SyntaxKind.ObjectLiteralExpression)) return;

  const keys = Object.keys(newMeta);

  keys.forEach(key => {
    const value = getObjectProperty(meta, key);
    if (!value) {
      meta.addPropertyAssignment({
        name: key,
        initializer: JSON.stringify(newMeta[key])
      });
    }
  });
}

export function getRawCodeByElements(elements: Expression[]) {
  return elements.map(el => el.getFullText()).join(',');
}

export function sortElements(elements: Expression[]) {
  return elements.sort((a, b) => {
    const aName = getRouteStringPropertyValue(a, 'name');
    const bName = getRouteStringPropertyValue(b, 'name');

    if (aName && bName) {
      return sortNodeName(aName, bName);
    }

    return 0;
  });
}

function getRouteStringProperty(element: Expression, propertyName: string) {
  return getStringProperty(element, propertyName);
}

export function getRouteStringPropertyValue(element: Expression, propertyName: string) {
  const value = getRouteStringProperty(element, propertyName);

  if (!value) return null;

  return value.getText().substring(1, value.getText().length - 1);
}

function getRouteMetaPropertyValue(element: Expression) {
  const meta = getObjectProperty(element, 'meta');

  if (!meta) return null;

  return meta;
}

function getNamePathMap(elements: Expression[]) {
  const namePathMap = new Map<string, string>();

  elements.forEach(element => {
    const routeName = getRouteStringPropertyValue(element, 'name');
    const routePath = getRouteStringPropertyValue(element, 'path');

    if (routeName && routePath) {
      namePathMap.set(routeName, routePath);
    }
  });

  return namePathMap;
}
