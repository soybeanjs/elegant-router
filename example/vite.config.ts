import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import VueDevtools from 'vite-plugin-vue-devtools';
import unocss from 'unocss/vite';
import Components from 'unplugin-vue-components/vite';
import SoybeanUIResolver from 'soy-ui/resolver';
import ElegantRouter from 'elegant-router/vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    vue(),
    vueJsx(),
    unocss(),
    Components({
      dts: 'src/typings/components.d.ts',
      types: [{ from: 'vue-router', names: ['RouterLink', 'RouterView'] }],
      resolvers: [SoybeanUIResolver()]
    }),
    ElegantRouter(),
    VueDevtools()
  ]
});
