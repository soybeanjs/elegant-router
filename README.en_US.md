# ElegantRouter

A file-system based automatic routing tool that simplifies route configuration and improves development efficiency.

[中文](./README.md) | English

## Introduction

ElegantRouter is a file-system based routing tool that automatically generates route definitions, component imports, and type definitions. Simply create route files following the convention rules without adding any additional configuration.

### Why ElegantRouter?

ElegantRouter differs from other file-system based routing tools in:

1. Other tools have complex configuration rules with black-box route data that's difficult to customize.
2. ElegantRouter follows an API-first principle, automating the route configuration process.

For example, traditional Vue routing requires:
1. Importing layout components
2. Importing page components
3. Defining routes in configuration files

While these steps aren't complex, they're repetitive and manual. Route name and path maintenance is cumbersome, and without clear conventions, route definitions can become messy.

With ElegantRouter, you only need to create route files according to conventions, and routes are automatically generated.

### Features

- **File-system Based** - Automatically generates route configuration based on file system
- **White-box Design** - Route data is transparent and easily customizable
- **Type Safety** - Automatically generates type definitions for type-safe navigation
- **Flexible Configuration** - Rich configuration options for different project needs
- **Layout Management** - Simplifies layout and component relationships
- **Code Splitting** - Automatically handles component imports and code splitting

### Core Functions

1. **Automatic Route Generation** - Creates route configuration from file system
2. **Type Definition Generation** - Generates route-related type definitions
3. **Import Management** - Handles component imports and code splitting
4. **Layout Integration** - Simplifies layout and component relationships
5. **Route Transformation** - Converts flat routes to nested routes

## Installation

```bash
pnpm install elegant-router
```

## Usage

### Including the Plugin in Vite

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ElegantRouter from "elegant-router/vite";

export default defineConfig({
  plugins: [
    vue(),
    ElegantRouter(),
  ]
});
```

### Integrating with Vue Router

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './_generated/routes';
import { layouts, views } from './_generated/imports';
import { transformToVueRoutes } from './_generated/transformer';

// Transform routes
const vueRoutes = transformToVueRoutes(routes, layouts, views);

const router = createRouter({
  history: createWebHistory(),
  routes: vueRoutes
});

export default router;
```

## Route File Creation Rules

The plugin is flexible with directory structure but following conventions improves development efficiency.

### Basic Routes

Creating `src/views/home/index.vue` automatically generates:

```ts
{
  name: 'Home',
  path: '/home',
  layout: 'base',
  component: 'Home'
}
```

> The `layout` field specifies the layout component, and `component` specifies the view component import key. The transformer converts this into a nested route structure with layout and children.

> Additional route properties like props, meta, and beforeEnter can be added to the existing route data.

### Routes with Parameters

Creating `src/views/list/[id].vue` generates a route with parameters:

```ts
{
  name: 'ListId',
  path: '/list/:id',
  layout: 'base',
  component: 'ListId'
}
```

### Optional Parameter Routes

Creating `src/views/list/detail2-[[id]]-[[userId]].vue` generates a route with optional parameters:

```ts
{
  name: 'ListDetail2IdUserId',
  path: '/list/detail2-:id?-:userId?',
  layout: 'base',
  component: 'ListDetail2IdUserId'
}
```

### Multiple Parameter Routes

Creating `src/views/list/detail_[id]_[userId].vue` generates a route with multiple parameters:

```ts
{
  name: 'ListDetailIdUserId',
  path: '/list/detail/:id/:userId',
  layout: 'base',
  component: 'ListDetailIdUserId'
}
```

### Group Routes

Creating `src/views/(group)/demo/index.vue` generates a group route:

```ts
{
  name: 'Demo',
  path: '/demo',
  component: 'Demo'
}
```

### Custom Routes

Custom routes allow reusing existing page route files.

#### Custom Route Configuration

```ts
ElegantRouter({
  customRoutes: {
    'CustomRoute': '/custom-route'
  },
});
```

#### Custom Route Component

```ts
{
  name: "CustomRoute",
  path: "/custom-route",
  layout: "base",
  component: "wip", // Using an existing page route file
}
```

## Automatically Generated Files

After starting the project, the plugin generates these files in the `routerGeneratedDir` (default: `src/router/_generated`):

1. **routes.ts** - Contains file-system based route configurations
2. **imports.ts** - Contains auto-imported layout and view components
3. **transformer.ts** - Provides route transformation functions
4. **shared.ts** - Provides route path and name mappings for easy reference

## Route Transformation Process

The transformer converts flat routes to the Vue Router format:

```ts
// Before transformation (flat route)
{
  name: 'Home',
  path: '/home',
  layout: 'base',
  component: 'Home'
}

// After transformation (Vue route)
// Grouped by layout
{
  path: '/base-layout',
  component: () => import('@/layouts/base/index.vue'),
  children: [
    {
      name: 'Home',
      path: '/home',
      component: () => import('@/views/home/index.vue')
    }
    // ...other routes with the same layout
  ]
}
```

## Configuration Options

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import ElegantRouter from 'elegant-router/vite';

export default defineConfig({
  plugins: [
    vue(),
    ElegantRouter({
      // Project root directory
      cwd: process.cwd(),

      // Watch file changes
      watchFile: true,

      // File update duration (ms)
      fileUpdateDuration: 500,

      // Page directories (can specify multiple)
      pageDir: ['src/pages', 'src/views'],

      // Page file match pattern
      pageInclude: '**/*.vue',

      // Excluded page files
      pageExclude: ['**/components/**', '**/modules/**'],

      // Type definition file path
      dts: 'src/typings/elegant-router.d.ts',

      // vue-router type definition file path
      vueRouterDts: 'src/typings/typed-router.d.ts',

      // tsconfig file path
      tsconfig: 'tsconfig.json',

      // Project alias configuration
      alias: {
        '@': 'src'
      },

      // Router generated directory
      routerGeneratedDir: 'src/router/_generated',

      // Layout configuration
      layouts: {
        base: 'src/layouts/base/index.vue',
        blank: 'src/layouts/blank/index.vue'
      },

      // Lazy loading for layout components
      layoutLazy: (layout) => true,

      // Custom routes (name:path)
      customRoute: {
        Root: '/',
        NotFound: '/:pathMatch(.*)*'
      },

      // Root route redirect path
      rootRedirect: '/home',

      // 404 route component
      notFoundRouteComponent: '404',

      // Default custom route component
      defaultCustomRouteComponent: 'wip',

      // Custom route path generation
      getRoutePath: (node) => node.path,

      // Custom route name generation
      getRouteName: (node) => node.name,

      // Custom route layout
      getRouteLayout: (node) => node.layout,

      // Lazy loading for route components
      routeLazy: (node) => true
    })
  ]
});
```

## Major Differences Between Versions

### 1. Design Philosophy Changes

#### Old Version
- **Tightly coupled route and menu data**: Strict directory structure for quick menu generation
- **Specific directory structure requirements**: No index.vue alongside subdirectories
- **Multi-level route generation**: Generated nested routes converted to Vue Router's two-level structure

#### New Version
- **Decoupled routes and menus**: Focus on route generation, menu data handled separately
- **More flexible directory structure**: Focus on file naming conventions, not strict directory structure
- **Flat route model**: Generates flat routes with layout and component info, transformed by layout groups

### 2. Technical Implementation Changes

#### Old Version
- **Component composition**: Used `layout.base$view.about` format for layouts and components
- **Recursive route structure**: Generated recursively nested routes, flattened during transformation
- **Generated files**: Created imports.ts, routes.ts, transform.ts

#### New Version
- **Separated layout and components**: Uses separate `layout` and `component` fields
- **Flat data model**: Generates simple flat routes, layouts grouped by transformer
- **Additional utility files**: Added shared.ts for route path and name mapping
- **Better type support**: More comprehensive type definitions for type-safe navigation

### 3. Generated Route Data Comparison

#### Old Version Example
```ts
// Single-level route
{
  name: 'about',
  path: '/about',
  component: 'layout.base$view.about',
  meta: {
    title: 'about'
  }
}

// Multi-level route
{
  name: 'list',
  path: '/list',
  component: 'layout.base',
  meta: {
    title: 'list'
  },
  children: [
    {
      name: 'list_home',
      path: '/list/home',
      component: 'view.list_home',
      meta: {
        title: 'list_home'
      }
    }
  ]
}
```

#### New Version Example
```ts
// All routes have flat structure
{
  name: 'Home',
  path: '/home',
  layout: 'base',
  component: 'Home'
}

{
  name: 'ListHome',
  path: '/list/home',
  layout: 'base',
  component: 'ListHome'
}
```

### 4. Transformed Route Structure Comparison

#### Old Version
```ts
// Single-level route transformation
{
  path: '/about',
  component: BaseLayout,
  children: [
    {
      name: 'about',
      path: '',
      component: () => import('@/views/about/index.vue'),
      meta: {
        title: 'about'
      }
    }
  ]
}

// Multi-level route transformation
{
  name: 'list',
  path: '/list',
  component: BaseLayout,
  redirect: {
    name: 'list_home'
  },
  meta: {
    title: 'list'
  },
  children: [
    {
      name: 'list_home',
      path: '/list/home',
      component: () => import('@/views/list/home/index.vue'),
      meta: {
        title: 'list_home'
      }
    }
  ]
}
```

#### New Version
```ts
// Transformed routes grouped by layout
{
  path: '/base-layout',
  component: () => import('@/layouts/base/index.vue'),
  children: [
    {
      name: 'Home',
      path: '/home',
      component: () => import('@/views/home/index.vue')
    },
    {
      name: 'ListHome',
      path: '/list/home',
      component: () => import('@/views/list/home/index.vue')
    }
    // ...other routes with the same layout
  ]
}
```

### New Version Improvements

1. **Simpler route model**: Flat route data model, easier to understand and maintain
2. **More flexible file structure**: No strict directory structure limitations
3. **Better type support**: More comprehensive type definitions for type-safe navigation
4. **Layout-based grouping**: Routes grouped by layout for better management
5. **Route mapping utilities**: shared.ts provides route name and path mapping
6. **Intuitive component naming**: Generated import names match file paths
7. **Higher extensibility**: Separated layout and component configuration

### Usage Recommendations

1. For projects using the old version with many pages based on its structure, continue using it or prepare thoroughly for migration
2. For new projects, use the new version for more flexible file structure and better type support
3. For complex menu requirements, develop custom menu generation logic

## Best Practices

1. Maintain reasonable file naming and directory structure for code maintenance
2. Use parameter routes appropriately: required parameters `[param]` or optional parameters `[[param]]`
3. Configure layout components and use the layout parameter to control page layout
4. Use shared.ts utility functions for type-safe navigation
5. Use lazy loading appropriately to improve application performance
