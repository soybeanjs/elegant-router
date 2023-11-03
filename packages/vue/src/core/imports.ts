import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import type { ElegantRouterFile } from '@elegant-router/core';
import type { ElegantVueRouterOption, LayoutFile } from '../types';
import { ensureFile } from '../shared/fs';
import { createPrefixCommentOfGenFile } from './comment';

function getImportsCode(files: ElegantRouterFile[], options: ElegantVueRouterOption) {
  const layoutFiles = getLayoutFile(options);

  const preCode = createPrefixCommentOfGenFile();

  let importCode = `import type { RouteComponent } from "vue-router";
import type { LastLevelRouteKey, RouteLayout } from "@elegant-router/types";

`;

  let exportLayoutCode = `export const layouts: Record<RouteLayout, RouteComponent | (() => Promise<RouteComponent>)> = {`;

  layoutFiles.forEach(file => {
    const { layoutName, importPath } = file;

    const isLazy = options.layoutLazyImport(layoutName);

    if (isLazy) {
      exportLayoutCode += `\n  ${layoutName}: () => import("${importPath}"),`;
    } else {
      const importKey = `${layoutName[0].toUpperCase()}${layoutName.substring(1)}Layout`;
      importCode += `import ${importKey} from "${file.importPath}";\n`;
      exportLayoutCode += `\n  ${layoutName}: ${importKey},`;
    }
  });

  importCode += '\n';
  exportLayoutCode += '\n};\n';

  let exportCode = `export const views: Record<LastLevelRouteKey, RouteComponent | (() => Promise<RouteComponent>)> = {`;

  files.forEach(file => {
    const isLazy = options.lazyImport(file.routeName);

    const key = file.routeName.includes('-') ? `"${file.routeName}"` : file.routeName;

    if (isLazy) {
      exportCode += `\n  ${key}: () => import("${file.importPath}"),`;
    } else {
      const importKey = getImportKey(file.routeName);
      importCode += `import ${importKey} from "${file.importPath}";\n`;

      exportCode += `\n  ${key}${key === importKey ? '' : `: ${importKey}`},`;
    }
  });

  exportCode += '\n};\n';

  return `${preCode}\n\n${importCode}${exportLayoutCode}\n${exportCode}`;
}

function getImportKey(name: string) {
  const NUM_REG = /^\d+$/;
  const SHORT_WITH_NUM_OR_CHAR_REG = /-[0-9|a-zA-Z]/g;

  let key = name;

  if (NUM_REG.test(name)) {
    key = `_${name}`;
  }

  key = key.replace(SHORT_WITH_NUM_OR_CHAR_REG, match => {
    let remain = match.replace('-', '').toUpperCase();
    if (NUM_REG.test(remain)) {
      remain = `_${remain}`;
    }
    return remain;
  });

  return key;
}

export async function genImportsFile(files: ElegantRouterFile[], options: ElegantVueRouterOption) {
  if (files.length === 0) return;

  const importsPath = path.posix.join(options.cwd, options.importsDir);

  await ensureFile(importsPath);

  const code = getImportsCode(files, options);

  await writeFile(importsPath, code);
}

export function getLayoutFile(options: ElegantVueRouterOption) {
  const { alias, layouts } = options;

  const layoutKeys = Object.keys(layouts);

  const files: LayoutFile[] = layoutKeys.map(key => {
    let importPath = layouts[key];

    Object.entries(alias).some(([a, dir]) => {
      const match = importPath.startsWith(dir);
      if (match) {
        importPath = importPath.replace(dir, a);
      }

      return match;
    });

    return {
      layoutName: key,
      importPath
    };
  });

  return files;
}
