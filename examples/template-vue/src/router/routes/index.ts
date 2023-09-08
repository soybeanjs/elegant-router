import type { ElegantRoute, CustomRoute } from '@elegant-router/types';
import { autoRoutes } from '../elegant/routes';
import { layouts, views } from '../elegant/imports';
import { transformElegantRouteToVueRoute } from '../elegant/transform';

const constantRoutes: CustomRoute[] = [
  {
    name: 'root',
    path: '/',
    redirect: {
      name: '403'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    component: 'layout.base',
    children: [
      {
        name: 'not-found',
        path: '',
        component: 'view.404'
      }
    ]
  }
];

const elegantRoutes: ElegantRoute[] = [...constantRoutes, ...autoRoutes];

export const routes = transformElegantRouteToVueRoute(elegantRoutes, layouts, views);
