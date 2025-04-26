import { createUnplugin } from 'unplugin';
import { AutoRouter } from './core';
import type { AutoRouterNode, AutoRouterOptions } from './types';

export default createUnplugin<Partial<AutoRouterOptions> | undefined>((options, _meta) => {
  const autoRouter = new AutoRouter(options);

  return [
    {
      name: 'unplugin-elegant-router',
      enforce: 'pre',
      vite: {
        apply: 'serve',
        async configureServer(server) {
          autoRouter.setViteServer(server);
        }
      }
    }
  ];
});

export type { AutoRouterOptions, AutoRouterNode };
