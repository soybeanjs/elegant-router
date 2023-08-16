export const autoRoutes = [
  {
    name: '403',
    path: '/403',
    component: 'layouts.default',
    meta: {
      key: '403'
    },
    children: [
      {
        path: '.',
        component: 'views.403',
        meta: {
          key: '403'
        }
      }
    ]
  },
  {
    name: 'demo-a',
    path: '/demo-a',
    component: 'layouts.default',
    meta: {
      key: 'demo-a'
    },
    children: [
      {
        name: 'demo-a_child1',
        path: '/demo-a/child1',
        component: 'views.demo-a_child1',
        meta: {
          key: 'demo-a_child1'
        }
      },
      {
        name: 'demo-a_child2',
        path: '/demo-a/child2',
        redirect: '/demo-a/child2/child3',
        meta: {
          key: 'demo-a_child2'
        }
      },
      {
        name: 'demo-a_child2_child3',
        path: '/demo-a/child2/child3',
        component: 'views.demo-a_child2_child3',
        meta: {
          key: 'demo-a_child2_child3'
        }
      },
      {
        name: 'demo-a_child3',
        path: '/demo-a/child3',
        component: 'views.demo-a_child3',
        meta: {
          key: 'demo-a_child3'
        }
      }
    ]
  },
  {
    name: 'demo3',
    path: '/demo3/:id',
    component: 'layouts.default',
    meta: {
      key: 'demo3'
    },
    children: [
      {
        path: '.',
        component: 'views.demo3',
        meta: {
          key: 'demo3'
        }
      }
    ]
  }
];
