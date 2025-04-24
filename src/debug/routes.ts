import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    name: 'root',
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [{ path: '/', component: () => import('@/views/home.vue') }]
  }
];
