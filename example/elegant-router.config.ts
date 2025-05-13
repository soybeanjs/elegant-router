import { defineConfig } from 'elegant-router';

export default defineConfig({
  pageInclude: ['**/*.vue', '**/*.tsx', '**/*.jsx'],
  customRoutes: ['/custom1/aa', '/custom2'],
  getRouteMeta: node => ({
    title: node.name
  })
});
