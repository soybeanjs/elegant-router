import { createUnplugin } from 'unplugin';
import { loadConfig } from 'unconfig';
import { AutoRouter } from './core';
import { CLI_CONFIG_SOURCE, SHORT_CLI_CONFIG_SOURCE } from './constants';
import { injectName } from './plugins/name';
import type { AutoRouterNode, AutoRouterOptions, PluginOptions } from './types';

export default createUnplugin<PluginOptions | undefined>((options, _meta) => {
  const { config } = loadConfig.sync<AutoRouterOptions>({
    sources: {
      files: [SHORT_CLI_CONFIG_SOURCE, CLI_CONFIG_SOURCE]
    }
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

export type { AutoRouterOptions, AutoRouterNode, PluginOptions };
