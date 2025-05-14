import { defineConfig } from 'elegant-router';

export default defineConfig({
  pageInclude: ['**/*.vue', '**/*.tsx', '**/*.jsx'],
  customRoutes: ['/custom1', '/custom2/:id', '/custom3/:id?', '/custom4/:id?/:name?'],
  getRouteMeta: node => ({
    title: node.name
  })
});
