import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import enquirer from 'enquirer';
import { AutoRouter } from '../core';
import { resolveNode } from '../core/node';
import { resolveGlob } from '../core/glob';
import { ensureFile, logger } from '../shared';
import type { CliOptions } from '../types';

interface AddRoutePrompt {
  file: string;
  layout: string;
  pageDir: string;
}

export async function addRoute(options: CliOptions) {
  const autoRouter = new AutoRouter(options);

  const resolvedOptions = autoRouter.getOptions();

  await autoRouter.generate();

  const { cwd, pageDir: $pageDir } = resolvedOptions;

  const pageDirs = Array.isArray($pageDir) ? $pageDir : [$pageDir];

  const result = await enquirer.prompt<AddRoutePrompt>([
    {
      type: 'input',
      name: 'file',
      message: 'please input the file path or name of the route 【输入路由文件路径或名称】'
    },
    {
      type: 'select',
      name: 'layout',
      message: 'please select the layout of the route 【选择路由布局】',
      choices: resolvedOptions.layouts.map(layout => layout.name)
    },
    {
      type: 'select',
      name: 'pageDir',
      message: 'please select the page directory of the route 【选择路由页面目录】',
      choices: pageDirs.map(dir => dir),
      skip: () => pageDirs.length === 1
    }
  ]);

  const { file, layout } = result;

  const pageDir = pageDirs.length === 1 ? pageDirs[0] : result.pageDir;

  const fileNameOrPath = file.includes('.') ? file : `${file}.vue`;

  const fullPath = path.resolve(cwd, pageDir, fileNameOrPath);

  await ensureFile(fullPath);

  if (existsSync(fullPath)) {
    logger.warn(`the route file ${fileNameOrPath} already exists 【路由文件 ${fileNameOrPath} 已存在】`);
    return;
  }

  validateExtension(fullPath);

  const resolvedGlob = resolveGlob(fileNameOrPath, pageDir, resolvedOptions);

  const node = resolveNode(resolvedGlob, resolvedOptions);

  if (autoRouter.nodes.find(item => item.name === node.name)) {
    logger.warn(`the route ${node.name} already exists 【路由 ${node.name} 已存在】`);
    return;
  }

  const template = createTemplate(fullPath, node.name);

  await writeFile(fullPath, template, 'utf-8');

  autoRouter.updateOptions({
    routeLayoutMap: {
      [fullPath]: layout
    }
  });

  await autoRouter.generate();

  logger.success(`the route ${fileNameOrPath} has been added 【路由 ${fileNameOrPath} 已添加】`);
}

type FileExtension = 'vue' | 'tsx' | 'jsx';

function getExtension(filepath: string) {
  const extension = filepath.split('.').pop();

  if (!extension) {
    throw new Error(`the route file ${filepath} has no extension 【路由文件 ${filepath} 没有扩展名】`);
  }

  return extension as FileExtension;
}

function validateExtension(filepath: string) {
  const extensions: FileExtension[] = ['vue', 'tsx', 'jsx'];

  const extension = getExtension(filepath);

  if (!extensions.includes(extension)) {
    throw new Error(
      `the route file ${filepath} has an invalid extension, it must be one of the following: ${extensions.join(', ')}. 【路由文件扩展名必须为：${extensions.join(', ')}之一】`
    );
  }
}

export function createTemplate(filepath: string, name: string) {
  const extension = getExtension(filepath);

  const templateMap: Record<FileExtension, string> = {
    vue: `<script setup lang="ts"></script>

<template>
  <div>${name}</div>
</template>
`,
    tsx: `import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => <div>${name}</div>;
  }
});
`,
    jsx: `import { defineComponent } from 'react';

export default defineComponent({
  setup() {
    return () => <div>${name}</div>;
  }
});
`
  };

  return templateMap[extension];
}
