import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit';
import '@nuxt/schema';
import vite from './vite';
import webpack from './webpack';
import type { AutoRouterOptions } from './types';

export default defineNuxtModule<AutoRouterOptions>({
  meta: {
    name: 'nuxt-elegant-router',
    configKey: 'elegantRouter'
  },
  defaults: {},
  setup(options, _nuxt) {
    addVitePlugin(() => vite(options));
    addWebpackPlugin(() => webpack(options));
  }
});
