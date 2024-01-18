import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import Inspect from 'vite-plugin-inspect';
import ElegantVueRouter from '@elegant-router/vue/vite';

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    ElegantVueRouter({
      layouts: {
        base: 'src/layouts/base-layout/index.vue',
        blank: 'src/layouts/blank-layout/index.vue'
      },
      customRoutes: {
        names: ['exception_403', 'exception_404', 'exception_500', 'list_detail']
      },
      layoutLazyImport: () => false
    }),
    Inspect()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
