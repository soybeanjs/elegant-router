import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['src/*.ts'],
  clean: true,
  splitting: true,
  cjsInterop: true,
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
  }
});
