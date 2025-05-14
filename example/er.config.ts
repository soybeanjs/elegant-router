import { defineConfig } from 'elegant-router';

export default defineConfig({
  pageInclude: ['**/*.vue', '**/*.tsx', '**/*.jsx'],
  reuseRoutes: ['/reuse1', '/reuse2/:id', '/reuse3/:id?', '/reuse4/:id?/:name?'],
  getRouteMeta: node => ({
    title: node.name
  })
});
