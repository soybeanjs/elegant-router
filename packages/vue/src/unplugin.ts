import { createUnplugin } from 'unplugin';
import ElegantVueRouter from './context';
import type { ElegantVueRouterOption } from './types';

export default createUnplugin<Partial<ElegantVueRouterOption> | undefined>((options, _meta) => {
  const ctx = new ElegantVueRouter(options);

  return {
    name: '@elegant-router/vue',
    enforce: 'pre',
    apply: 'serve',
    vite: {
      configureServer(server) {
        ctx.setViteServer(server);
      }
    }
  };
});
