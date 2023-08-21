import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { createPrefixCommentOfGenFile } from './comment';
import { ensureFile } from '../shared/fs';
import type { ElegantVueRouterOption } from '../types';

export function getTransformCode() {
  const prefixComment = createPrefixCommentOfGenFile();

  const code = `${prefixComment}

import type { RouteRecordRaw, RouteComponent } from 'vue-router';
import type { AutoRoute } from '@elegant-router/vue';

const LAYOUT_PREFIX = 'layout.';
const VIEW_PREFIX = 'view.';

/**
 * transform elegant route to vue route
 * @param routes elegant routes
 * @param layouts layout components
 * @param views view components
 */
export function transformElegantRouteToVueRoute(
  routes: AutoRoute[],
  layouts: Record<string, RouteComponent | (() => Promise<RouteComponent>)>,
  views: Record<string, RouteComponent | (() => Promise<RouteComponent>)>
) {
  const vueRoutes: RouteRecordRaw[] = routes.map(route => {
    const { children, component, ...rest } = route;

    const vueRoute = { ...rest } as RouteRecordRaw;

    if (component) {
      if (isLayout(component)) {
        const layoutName = getLayoutName(component);

        vueRoute.component = layouts[layoutName];
      }

      if (isView(component)) {
        const viewName = getViewName(component);

        vueRoute.component = views[viewName];
      }
    }

    if (children?.length) {
      vueRoute.children = transformElegantRouteToVueRoute(children, layouts, views);
    }

    return vueRoute;
  });

  return vueRoutes;
}

function isLayout(component: string) {
  return component.startsWith(LAYOUT_PREFIX);
}

function getLayoutName(component: string) {
  return component.replace(LAYOUT_PREFIX, '');
}

function isView(component: string) {
  return component.startsWith(VIEW_PREFIX);
}

function getViewName(component: string) {
  return component.replace(VIEW_PREFIX, '');
}
`;

  return code;
}

/**
 * generate the transform file
 * @param options
 */
export async function genTransformFile(options: ElegantVueRouterOption) {
  const code = getTransformCode();

  const transformPath = path.posix.join(options.cwd, options.transformDir);

  ensureFile(transformPath);

  await writeFile(transformPath, code);
}
