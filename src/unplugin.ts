import { createUnplugin } from 'unplugin';
import { loadConfig } from 'unconfig';
import { AutoRouter } from './core';
import type { AutoRouterNode, AutoRouterOptions } from './types';

export default createUnplugin<Partial<AutoRouterOptions> | undefined>((options, _meta) => {
  const { config } = loadConfig.sync<AutoRouterOptions>({
    sources: [
      {
        files: 'elegant-router.config'
      }
    ]
  });

  const autoRouter = new AutoRouter({ ...options, ...config });

  return [
    {
      name: 'unplugin-elegant-router',
      enforce: 'pre',
      vite: {
        apply: 'serve',
        async configureServer(server) {
          await autoRouter.generate();
          if (options?.watchFile) {
            autoRouter.watch();
          }

          autoRouter.setViteServer(server);
        }
      }
    }
  ];
});

export type { AutoRouterOptions, AutoRouterNode };
