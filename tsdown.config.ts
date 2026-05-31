import { defineConfig } from 'tsdown';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  entry: ['src/*.ts'],
  platform: 'node',
  deps: {
    neverBundle: [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.devDependencies),
      'rollup',
      'webpack',
      'esbuild',
      'vite',
      'nuxt',
      'rspack',
      'farm',
      'rolldown',
      'vue',
      'vue-router'
    ]
  },
  clean: true,
  dts: true,
  sourcemap: false,
  minify: false,
  fixedExtension: false
});
