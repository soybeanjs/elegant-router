import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import type { AutoRouterNode, ParsedAutoRouterOptions } from '../types';
import { createPrefixCommentOfGenFile, ensureFile } from '../shared';

export async function generateRoutes(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const { cwd, routerGeneratedDir } = options;

  const routesPath = path.posix.join(cwd, routerGeneratedDir, 'routes.ts');

  await ensureFile(routesPath);

  const code = getRoutesCode(nodes, options);

  await writeFile(routesPath, code);
}

function getRoutesCode(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const { layouts } = options;

  const preCode = createPrefixCommentOfGenFile();

  const code = `${preCode}

export const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [
      { path: '/', component: () => import('@/views/home.vue') }
    ]
  }
]
`;

  return code;
}
