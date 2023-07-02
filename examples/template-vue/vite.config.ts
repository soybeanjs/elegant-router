import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import ElegentVueRouter from '@elegent-router/vue/vite';

export default defineConfig({
  plugins: [vue(), vueJsx(), ElegentVueRouter({})],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
