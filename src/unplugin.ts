import { createUnplugin } from 'unplugin';
import { loadConfig } from 'unconfig';
import { AutoRouter } from './core';
import { injectName } from './plugins/name';
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

  const autoRouterOptions = autoRouter.getOptions();

  return [
    {
      name: 'unplugin-elegant-router',
      enforce: 'pre',
      vite: {
        apply: 'serve',
        async configureServer(server) {
          await autoRouter.generate();
          if (autoRouterOptions.watchFile) {
            autoRouter.watch();
          }

          autoRouter.setViteServer(server);
        }
      }
    },
    injectName(autoRouterOptions)
  ];
});

export type { AutoRouterOptions, AutoRouterNode };
