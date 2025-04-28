import { Buffer } from 'node:buffer';
import path from 'node:path';
import { createFilter, normalizePath } from 'unplugin-utils';
import { Project, SyntaxKind } from 'ts-morph';
import type { ObjectLiteralExpression, SourceFile } from 'ts-morph';
import type { UnpluginOptions } from 'unplugin';
import { resolveGlob } from '../core/glob';
import { resolveNode } from '../core/node';
import type { ParsedAutoRouterOptions } from '../types';

export function injectName(options: ParsedAutoRouterOptions) {
  const { pageInclude, pageExclude, pageDir } = options;

  const includes = Array.isArray(pageInclude) ? pageInclude : [pageInclude];
  const pageDirs = Array.isArray(pageDir) ? pageDir : [pageDir];
  const dirPatterns = pageDirs.flatMap(dir => includes.map(include => path.join(dir, include)));

  const filter = createFilter(dirPatterns, pageExclude);

  const project = new Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true
  });

  const plugin: UnpluginOptions = {
    name: 'inject-name',
    enforce: 'post',
    transform(code, id) {
      if (!filter(id)) {
        return code;
      }

      const normalizedId = normalizePath(id);
      const currentPageDir = pageDirs.find(dir => normalizedId.includes(dir));

      if (!currentPageDir) {
        return code;
      }

      const pageDirPath = path.resolve(options.cwd, currentPageDir);
      const glob = normalizedId.replace(pageDirPath, '');

      const resolvedGlob = resolveGlob(glob, currentPageDir, options);
      const node = resolveNode(resolvedGlob, options);

      let sourceFile: SourceFile | undefined;
      try {
        const tempFileName = createTempFileName(id);
        sourceFile = project.createSourceFile(tempFileName, code, { overwrite: true });

        const componentOptions = getComponentOptions(sourceFile, id);
        if (!componentOptions) {
          return code;
        }

        // 获取 name 属性
        const nameProperty = componentOptions.getProperty('name');
        if (nameProperty) {
          return code;
        }

        // 添加 name 属性
        componentOptions.addPropertyAssignment({
          name: 'name',
          initializer: `"${node.name}"`
        });

        // 获取修改后的代码
        return sourceFile.getFullText();
      } catch {
        return code;
      } finally {
        if (sourceFile) {
          project.removeSourceFile(sourceFile);
        }
      }
    }
  };

  return plugin;
}

function getComponentOptions(sourceFile: SourceFile, id: string): ObjectLiteralExpression | undefined {
  if (id.endsWith('.vue')) {
    return getVueComponentOptions(sourceFile);
  }
  if (id.endsWith('.tsx') || id.endsWith('.jsx')) {
    return getTsxComponentOptions(sourceFile);
  }
  return undefined;
}

function getVueComponentOptions(sourceFile: SourceFile): ObjectLiteralExpression | undefined {
  const sfcMain = sourceFile.getVariableDeclaration('_sfc_main');
  if (!sfcMain) {
    return undefined;
  }

  const initializer = sfcMain.getInitializer();
  if (!initializer) {
    return undefined;
  }

  return getComponentOptionsFromInitializer(initializer);
}

function getTsxComponentOptions(sourceFile: SourceFile): ObjectLiteralExpression | undefined {
  // 查找 __default__ 变量
  const defaultVar = sourceFile.getVariableDeclaration('__default__');
  if (!defaultVar) {
    return undefined;
  }

  const initializer = defaultVar.getInitializer();
  if (!initializer) {
    return undefined;
  }

  return getComponentOptionsFromInitializer(initializer);
}

function getComponentOptionsFromInitializer(initializer: any): ObjectLiteralExpression | undefined {
  if (initializer.isKind(SyntaxKind.CallExpression)) {
    const callExpr = initializer.asKind(SyntaxKind.CallExpression);
    if (callExpr?.getExpression().getText() === 'defineComponent') {
      const args = callExpr.getArguments();
      if (args.length > 0 && args[0].isKind(SyntaxKind.ObjectLiteralExpression)) {
        return args[0];
      }
    }
  } else if (initializer.isKind(SyntaxKind.ObjectLiteralExpression)) {
    return initializer;
  }
  return undefined;
}

function createTempFileName(id: string) {
  return `temp_${Buffer.from(id)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '_')}.ts`;
}
