import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { createPrefixCommentOfGenFile, ensureFile } from '../shared';
import type { AutoRouterNode, ParsedAutoRouterOptions } from '../types';
import { ELEGANT_ROUTER_TYPES_MODULE_NAME } from '../constants';

export async function generateImportsFile(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const { cwd, routerGeneratedDir } = options;

  const importsPath = path.posix.join(cwd, routerGeneratedDir, 'imports.ts');

  await ensureFile(importsPath);

  const code = getImportsCode(nodes, options);

  await writeFile(importsPath, code);
}

export function getImportsCode(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const { layouts } = options;

  const preCode = createPrefixCommentOfGenFile();

  let importCode = `import type { RouteFileKey, RouteLayoutKey, RawRouteComponent } from "${ELEGANT_ROUTER_TYPES_MODULE_NAME}";\n`;
  let exportLayoutCode = `\nexport const layouts: Record<RouteLayoutKey, RawRouteComponent> = {`;

  layouts.forEach(layout => {
    const { name, importName, importPath, isLazy } = layout;

    if (isLazy) {
      exportLayoutCode += `\n  ${name}: () => import("${importPath}"),`;
    } else {
      importCode += `import ${importName} from "${importPath}";\n`;
      exportLayoutCode += `\n  ${name}: ${importName},`;
    }
  });

  exportLayoutCode += '\n};\n';

  let exportCode = `export const views: Record<RouteFileKey, RawRouteComponent> = {`;

  nodes
    .filter(node => !node.isCustom)
    .forEach(node => {
      const { name, importName, importPath, isLazy } = node;

      if (isLazy) {
        exportCode += `\n  ${name}: () => import("${importPath}"),`;
      } else {
        importCode += `import ${importName} from "${importPath}";\n`;
        exportCode += `\n  ${name}${name === importName ? '' : `: ${importName}`},`;
      }
    });

  exportCode += '\n};\n';

  return `${preCode}\n\n${importCode}${exportLayoutCode}\n${exportCode}`;
}
