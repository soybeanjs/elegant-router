import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/vite',
    'src/webpack',
    'src/rollup',
    'src/esbuild',
    'src/rspack',
    'src/nuxt',
    'src/farm',
    'src/rolldown'
  ],
  clean: true,
  declaration: true,
  externals: [
    'esbuild',
    'vite',
    'webpack',
    'rollup',
    'vue-router',
    'rspack',
    '@nuxt/kit',
    '@nuxt/schema',
    'farm',
    'rolldown'
  ],
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    esbuild: {
      minify: true
    }
  }
});
