import { defineConfig } from 'tsdown';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/cli.ts',
    'src/vite.ts',
    'src/webpack.ts',
    'src/rollup.ts',
    'src/esbuild.ts',
    'src/rspack.ts',
    'src/nuxt.ts',
    'src/farm.ts',
    'src/rolldown.ts'
  ],
  platform: 'node',
  external: Object.keys(pkg.devDependencies),
  clean: true,
  dts: true,
  sourcemap: false,
  minify: false,
  fixedExtension: false
});
