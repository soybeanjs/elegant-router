import type { App } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import type { Router } from 'vue-router';
import { routes } from './_generated/routes';
import { transformToVueRoutes } from './_generated/transformer';
import { layouts, views } from './_generated/imports';

export const router = createRouter({
  history: createWebHistory(),
  routes: transformToVueRoutes(routes, layouts, views)
});

/**
 * Router guard
 *
 * @param router - Router instance
 */
function createRouterGuard(_router: Router) {}

/** Setup Vue Router */
export async function setupRouter(app: App) {
  app.use(router);
  createRouterGuard(router);
  await router.isReady();
}
