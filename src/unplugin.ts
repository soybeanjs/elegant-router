import { createUnplugin } from 'unplugin';
import { AutoRouter } from './core';
import type { AutoRouterNode, AutoRouterOptions } from './types';

export default createUnplugin<Partial<AutoRouterOptions> | undefined>((options, _meta) => {
  // eslint-disable-next-line no-new
  new AutoRouter(options);

  return [
    {
      name: '@elegant-router/core-next',
      enforce: 'pre'
      // vite: {
      //   apply: 'serve',
      //   configResolved() {
      //     ctx.setupFSWatcher();
      //   },
      //   configureServer(server) {
      //     ctx.setViteServer(server);
      //   }
      // }
    }
  ];
});

export type { AutoRouterOptions, AutoRouterNode };
