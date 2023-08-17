import type { ElegantVueRoute } from '@elegant-router/types';

export const autoRoutes: ElegantVueRoute[] = [
  {
    name: '403',
    path: '/403',
    component: 'layout.default',
    meta: {
      title: '403'
    },
    children: [
      {
        path: '.',
        component: 'view.403',
        meta: {
          title: '403'
        }
      }
    ]
  },
  {
    name: 'demo-a',
    path: '/demo-a',
    component: 'layout.default',
    meta: {
      title: 'demo-a'
    },
    children: [
      {
        name: 'demo-a_child1',
        path: '/demo-a/child1',
        component: 'view.demo-a_child1',
        meta: {
          title: 'demo-a_child1'
        }
      },
      {
        name: 'demo-a_child2',
        path: '/demo-a/child2',
        redirect: '/demo-a/child2/child3',
        meta: {
          title: 'demo-a_child2'
        }
      },
      {
        name: 'demo-a_child2_child3',
        path: '/demo-a/child2/child3',
        component: 'view.demo-a_child2_child3',
        meta: {
          title: 'demo-a_child2_child3'
        }
      },
      {
        name: 'demo-a_child3',
        path: '/demo-a/child3',
        component: 'view.demo-a_child3',
        meta: {
          title: 'demo-a_child3'
        }
      }
    ],
    redirect: '/demo-a/child1'
  },
  {
    name: 'demo3',
    path: '/demo3/:id',
    component: 'layout.default',
    meta: {
      title: 'demo3'
    },
    children: [
      {
        path: '.',
        component: 'view.demo3',
        meta: {
          title: 'demo3'
        }
      }
    ]
  }
];
