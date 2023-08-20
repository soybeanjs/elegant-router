import { defineConfig } from 'tsup';

// const extMap: Record<Format, string> = {
//   cjs: '.cjs',
//   esm: '.mjs',
//   iife: '.js'
// };

export default defineConfig({
  splitting: true,
  entryPoints: ['src/*.ts'],
  clean: true,
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs'
    };
  },
  dts: true,
  external: ['esbuild'],
  esbuildOptions: options => {
    if (options.define?.TSUP_FORMAT === '"esm"') {
      options.banner = {
        js: `import { createRequire } from 'module';
const require = createRequire(import.meta.url);`
      };
    }
  },
  onSuccess: 'npm run build:fix'
});
