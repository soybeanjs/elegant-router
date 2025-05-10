import path from 'node:path';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { IndentationText, Project, SyntaxKind } from 'ts-morph';
import type { ArrayLiteralExpression, Expression, SourceFile } from 'ts-morph';
import { createPrefixCommentOfGenFile, ensureFile, getStringProperty, updateStringProperty } from '../shared';
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
    const code = await createEmptyRoutes(nodes, options.rootRedirect);
    await writeFile(routesPath, code);

    return;
  }

  await updateRoutes(nodes, statInfo, routesPath, cwd);
}

async function updateRoutes(nodes: AutoRouterNode[], statInfo: NodeStatInfo, routesPath: string, cwd: string) {
  const { sourceFile, routesExpression } = await getRouteSourceFile(routesPath);

  const namePathMap = getNamePathMap(routesExpression.getElements());

  const { createdNames, deletedNames, updatedNames } = getRouteStatInfo(nodes, namePathMap, statInfo);

  if (createdNames.length > 0) {
    const createdRoutes = nodes.filter(node => createdNames.includes(node.name));

    createdRoutes.forEach(node => {
      const routeStr = createRouteString(node, 0);

      routesExpression.addElement(routeStr);
    });
  }

  if (deletedNames.length > 0) {
    const routeBackup: RouteBackup = {};

    for await (const deletedName of deletedNames) {
      const elements = routesExpression.getElements();

      const index = elements.findIndex(el => getRouteStringPropertyValue(el, 'name') === deletedName);

      if (index !== -1) {
        const routeElement = elements[index];
        const routeText = routeElement.getFullText();

        const nodeBackupItem = await getNodeBackupItem(cwd, deletedName);

        if (nodeBackupItem) {
          routeBackup[deletedName] = {
            filepath: nodeBackupItem.filepath,
            routeCode: routeText
          };
        }

        routesExpression.removeElement(index);
      }
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

  const routes = sourceFile.getVariableDeclaration('routes');

  const error = 'routes.ts content is not valid 【文件routes.ts内容不合法，请直接删除重新生成】';

  if (!routes) {
    throw new Error(error);
  }

  const initializer = routes.getInitializer();

  if (!initializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
    throw new Error(error);
  }

  const routesExpression = initializer.asKindOrThrow(SyntaxKind.ArrayLiteralExpression);

  return {
    sourceFile,
    routesExpression
  };
}

export async function saveRouteSourceFile(sourceFile: SourceFile, routesExpression: ArrayLiteralExpression) {
  const sortedElements = sortElements(routesExpression.getElements());
  const code = getRawCodeByElements(sortedElements);

  routesExpression.replaceWithText(`[${code}\n]`);

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

async function createEmptyRoutes(nodes: AutoRouterNode[], rootRedirect: string) {
  const preCode = createPrefixCommentOfGenFile();

  const code = `${preCode}

import type { AutoRouterRoute } from '${ELEGANT_ROUTER_TYPES_MODULE_NAME}';

export const routes: AutoRouterRoute[] = [
${nodes.map(node => createRouteString(node, 2, rootRedirect)).join('\n')}
];
`;

  return code;
}

function createRouteString(node: AutoRouterNode, space = 2, rootRedirect?: string) {
  let code = `${getSpace(space)}{
${getSpace(space + 2)}name: '${node.name}',
${getSpace(space + 2)}path: '${node.path}',`;

  if (node.name === ROOT_ROUTE_NAME && rootRedirect) {
    code += `\n${getSpace(space + 2)}redirect: '${rootRedirect}',`;
  }

  if (node.layout) {
    code += `\n${getSpace(space + 2)}layout: '${node.layout}',`;
  }

  if (node.component) {
    code += `\n${getSpace(space + 2)}component: '${node.component}',`;
  }

  code += `\n${getSpace(space)}},`;

  return code;
}

function getSpace(space: number) {
  return ' '.repeat(space);
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
