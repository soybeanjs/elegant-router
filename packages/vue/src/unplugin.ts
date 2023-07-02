import { createUnplugin } from 'unplugin';
import ElegentVueRouter from './context';
import type { ElegentVueRouterOption } from './types';

export default createUnplugin<Partial<ElegentVueRouterOption> | undefined>((options, _meta) => {
  const ctx = new ElegentVueRouter(options);

  return {
    name: '@elegent-router/vue',
    enforce: 'pre',
    apply: 'serve',
    vite: {
      configureServer(server) {
        ctx.setViteServer(server);
      }
    }
  };
});
