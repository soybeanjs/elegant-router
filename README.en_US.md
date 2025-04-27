# ElegantRouter

A file-system based automatic routing tool for Vue.js, simplifying route configuration and improving development efficiency.

English | [中文](./README.md)

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Build Tool Support](#build-tool-support)
- [Quick Start](#quick-start)
- [Route Creation Conventions](#route-creation-conventions)
- [How It Works](#how-it-works)
- [Configuration Options](#configuration-options)
- [Version Comparison](#version-comparison)
- [Best Practices](#best-practices)

## Introduction

ElegantRouter is an innovative routing management tool designed for Vue.js applications, specifically created to simplify Vue Router configuration. It automatically generates routes based on file system structure, eliminating the tedious process of manual route configuration and allowing developers to focus on implementing application features.

With ElegantRouter, you only need to create Vue page files following conventional naming rules, and the system will automatically:

- Parse file paths to generate route paths
- Create intuitive route names
- Handle nested routes and route parameters
- Manage relationships between layouts and pages
- Generate complete type definitions

This convention-based route generation approach not only improves development efficiency but also enhances project maintainability and scalability. There's no need to manually define each route in separate configuration files; the route structure automatically updates with changes to the file system, ensuring route configurations stay synchronized with the actual page structure.

### Background

Traditional Vue Router configuration typically requires developers to manually complete multiple steps: importing layout components, importing page components, defining route configurations, etc. While these steps are simple, they become tedious and error-prone in large projects. Especially when maintaining a large number of routes, maintaining consistency in route names and paths becomes challenging, often leading to messy and difficult-to-manage route definitions.

ElegantRouter aims to solve these problems by simplifying the route configuration process for Vue applications through file system conventions. Compared to similar tools, ElegantRouter's unique advantages include:

1. **Simplified Configuration** - Other tools often have numerous configuration rules and treat route data as a black box that's difficult to customize; ElegantRouter adopts a white-box design, making route data transparent and easy to extend.

2. **API-First** - Following the API-first principle, it completely automates the route configuration process, reducing manual intervention.

With ElegantRouter, you only need to create files according to conventions, and the system will automatically recognize and generate corresponding route configurations, greatly improving Vue application development efficiency and reducing maintenance costs.

### Features

ElegantRouter provides a series of powerful features that make route management simple and efficient:

- **File System Driven** - No manual configuration needed; route structure is derived directly from the file system, reducing maintenance work
- **Transparent Data Structure** - Route data is completely transparent, making it easy to debug and customize
- **Type-Safe Navigation** - Automatically generates type definition files, providing complete type inference and smart hints
- **Flexible Configuration** - Offers rich configuration options to meet various complex scenario requirements
- **Intelligent Layout Management** - Automatically handles relationships between layouts and page components, simplifying nested route creation
- **Performance Optimization** - Built-in support for code splitting and lazy loading to optimize application performance

### Core Functions

ElegantRouter's core functionality is designed around simplifying development processes and improving efficiency:

1. **Automatic Route Generation** - Automatically generates complete route configurations from the file system, including paths, names, and nested relationships
2. **Type Definition Generation** - Creates type declaration files to ensure type-safe route operations
3. **Component Import Optimization** - Handles dynamic component imports and code splitting to enhance application performance
4. **Layout System Integration** - Simplifies the association between layouts and page components, automatically handling nested routes
5. **Route Transformation** - Converts a concise single-level route structure into the nested route structure required by the framework

## Installation

Install ElegantRouter using a package manager:

```bash
pnpm install elegant-router
```

## Build Tool Support

ElegantRouter supports various mainstream build tools to accommodate different project environment requirements. Regardless of which build tool you use, ElegantRouter provides a consistent automatic route generation experience.

### Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ElegantRouter from "elegant-router/vite";

export default defineConfig({
  plugins: [
    vue(),
    ElegantRouter({
      // Configuration options
    }),
  ]
});
```

### Webpack

```ts
// webpack.config.js
const ElegantRouter = require('elegant-router/webpack');

module.exports = {
  // Other configurations...
  plugins: [
    new ElegantRouter({
      // Configuration options
    })
  ]
};
```

### Rollup

```ts
// rollup.config.js
import ElegantRouter from 'elegant-router/rollup';

export default {
  // Other configurations...
  plugins: [
    ElegantRouter({
      // Configuration options
    })
  ]
};
```

### ESBuild

```ts
// esbuild.config.js
const { build } = require('esbuild');
const ElegantRouter = require('elegant-router/esbuild');

build({
  // Other configurations...
  plugins: [
    ElegantRouter({
      // Configuration options
    })
  ]
});
```

### UnPlugins Universal Interface

ElegantRouter also provides a UnPlugins universal interface that can be used in build tools that support UnPlugins:

```ts
import { createUnplugin } from 'elegant-router/unplugin';

const ElegantRouterUnplugin = createUnplugin({
  // Configuration options
});

// Then use the appropriate method according to different build tools
// ElegantRouterUnplugin.vite()
// ElegantRouterUnplugin.webpack()
// ElegantRouterUnplugin.rollup()
// etc...
```

## Quick Start

### Configuring in a Vite Project

Add the ElegantRouter plugin to your Vite configuration:

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ElegantRouter from "elegant-router/vite";

export default defineConfig({
  plugins: [
    vue(),
    ElegantRouter(),  // Use default configuration
  ]
});
```

### Integrating with Vue Router

Import the generated route data in your router file:

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

## Route Creation Conventions

ElegantRouter creates routes based on file system conventions, following simple and intuitive rules. The new version is designed to be more flexible, not enforcing directory structure but providing clear file naming conventions.

### Basic Routes

Create a regular page component to automatically generate the corresponding route:

**File Path:** `src/views/home/index.vue`

**Generated Route:**
```ts
{
  name: 'Home',
  path: '/home',
  layout: 'base',
  component: 'Home'
}
```

> The `layout` property specifies the layout component used by the page, and the `component` property identifies the view component. The transformer builds the final nested route structure based on this information.

> You can add other properties to the generated route object, such as `meta`, `props`, `beforeEnter`, etc., to meet specific needs.

### Parameter Routes

Use bracket syntax to create routes with parameters:

**File Path:** `src/views/list/[id].vue`

**Generated Route:**
```ts
{
  name: 'ListId',
  path: '/list/:id',
  layout: 'base',
  component: 'ListId'
}
```

### Optional Parameter Routes

Use double bracket syntax to create routes with optional parameters:

**File Path:** `src/views/list/detail-[[id]]-[[userId]].vue`

**Generated Route:**
```ts
{
  name: 'ListDetailIdUserId',
  path: '/list/detail-:id?-:userId?',
  layout: 'base',
  component: 'ListDetailIdUserId'
}
```

### Multiple Parameter Routes

Use underscores to separate multiple parameters:

**File Path:** `src/views/list/detail_[id]_[userId].vue`

**Generated Route:**
```ts
{
  name: 'ListDetailIdUserId',
  path: '/list/detail/:id/:userId',
  layout: 'base',
  component: 'ListDetailIdUserId'
}
```

### Group Routes

Use parentheses to create groups that don't affect the route path:

**File Path:** `src/views/(group)/demo/index.vue`

**Generated Route:**
```ts
{
  name: 'Demo',
  path: '/demo',
  component: 'Demo'
}
```

### Custom Routes

For special requirements, custom routes can be configured:

#### Configuration Method

```ts
ElegantRouter({
  customRoutes: {
    'CustomRoute': '/custom-route',
    'NotFound': '/:pathMatch(.*)*'
  },
});
```

#### Route Result

```ts
{
  name: "CustomRoute",
  path: "/custom-route",
  layout: "base",
  component: "wip", // Using an existing page route file
}
```

## How It Works

### File Watching Mechanism

When starting the project, the plugin initializes a file watcher that monitors page file changes in real-time. When file additions, deletions, or renames are detected, the plugin automatically regenerates the route-related content without requiring manual intervention or service restarts. This ensures that route configurations always stay synchronized with the actual file structure, greatly enhancing the development experience.

The watcher's main features include:

- **Real-time Response** - Updates route configurations immediately after file changes
- **Intelligent Recognition** - Only processes file changes that conform to routing conventions
- **Incremental Updates** - Only regenerates affected route content, improving performance
- **Debounce Processing** - Batch file changes are processed together within a short time frame, avoiding frequent updates

The `watchFile` configuration option controls whether the file watching functionality is enabled, and the `fileUpdateDuration` option sets the debounce delay time.

### Generated File Structure

After starting the project, ElegantRouter generates the following files in the configured directory (default: `src/router/_generated`):

1. **routes.ts** - Stores complete route configurations generated from the file system
2. **imports.ts** - Contains automatic import statements for all layout and view components
3. **transformer.ts** - Provides route transformation functions to convert single-level routes to nested structures
4. **shared.ts** - Provides type-safe route utility functions for referencing routes in code

### Route Transformation Process

ElegantRouter uses a single-level to nested route transformation process to simplify route management:

```ts
// Generated single-level route (simple and intuitive)
{
  name: 'Home',
  path: '/home',
  layout: 'base',
  component: 'Home'
}

// Transformed nested route (grouped by layout)
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

ElegantRouter provides rich configuration options to meet various project needs:

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

      // Whether to watch file changes
      watchFile: true,

      // File update interval (milliseconds)
      fileUpdateDuration: 500,

      // Page directories (can specify multiple)
      pageDir: ['src/pages', 'src/views'],

      // Page file matching pattern
      pageInclude: '**/*.vue',

      // Excluded page files
      pageExclude: ['**/components/**', '**/modules/**'],

      // Type definition file path
      dts: 'src/typings/elegant-router.d.ts',

      // Vue-router type definition file path
      vueRouterDts: 'src/typings/typed-router.d.ts',

      // tsconfig file path
      tsconfig: 'tsconfig.json',

      // Project alias configuration, defaults to parsing aliases from tsconfig's compilerOptions.paths
      alias: {},

      // Router generated directory
      routerGeneratedDir: 'src/router/_generated',

      // Layout configuration
      layouts: {
        base: 'src/layouts/base/index.vue',
        blank: 'src/layouts/blank/index.vue'
      },

      // Whether to lazy load layout components
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

      // Whether to lazy load route components
      routeLazy: (node) => true
    })
  ]
});
```

## Version Comparison

ElegantRouter has undergone significant upgrades, with the new version featuring notable changes in design philosophy and implementation to provide a better development experience.

### Design Philosophy Evolution

|   | Old Version | New Version |
|---|-------------|-------------|
| **Routes and Menus** | Tightly coupled design, route and menu data closely linked | Completely decoupled, focusing on route generation with menus configurable independently |
| **Directory Structure** | Strict limitations, such as prohibiting subdirectories with sibling index.vue files | More flexible, no strict limitations, focus on file naming conventions |
| **Route Model** | Multi-level nested structure requiring complex conversion | Concise single-level structure, transformed by grouping layouts |
| **Data Transparency** | Intermediate data difficult to understand and debug | Completely transparent white-box design, easy to understand and extend |

### Technical Implementation Changes

#### Old Version Implementation
- **Component Association**: Used special strings (e.g., `layout.base$view.about`) to represent component relationships
- **Route Data Structure**: Generated complex nested route structures, then converted to the required framework format
- **Generated Files**: Produced the basic imports.ts, routes.ts, and transform.ts files

#### New Version Implementation
- **Component Association**: Uses separate `layout` and `component` fields to clearly represent component relationships
- **Route Data Structure**: Generates simple single-level route structures, grouped by layout through the transformer
- **Enhanced Utility Functions**: Added shared.ts to provide route name and path mapping tools
- **Optimized Type Support**: Provides more comprehensive type definitions for an enhanced development experience

### Route Data Structure Comparison

#### Old Version Route Example
```ts
// Single-level route
{
  name: 'about',
  path: '/about',
  component: 'layout.base$view.about',
  meta: { title: 'about' }
}

// Multi-level route
{
  name: 'list',
  path: '/list',
  component: 'layout.base',
  meta: { title: 'list' },
  children: [
    {
      name: 'list_home',
      path: '/list/home',
      component: 'view.list_home',
      meta: { title: 'list_home' }
    }
  ]
}
```

#### New Version Route Example
```ts
// Unified single-level route structure
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

### Transformed Route Structure Comparison

#### Old Version Transformation Result
```ts
// Single-level route after transformation
{
  path: '/about',
  component: BaseLayout,
  children: [
    {
      name: 'about',
      path: '',
      component: () => import('@/views/about/index.vue'),
      meta: { title: 'about' }
    }
  ]
}

// Multi-level route after transformation
{
  name: 'list',
  path: '/list',
  component: BaseLayout,
  redirect: { name: 'list_home' },
  meta: { title: 'list' },
  children: [
    {
      name: 'list_home',
      path: '/list/home',
      component: () => import('@/views/list/home/index.vue'),
      meta: { title: 'list_home' }
    }
  ]
}
```

#### New Version Transformation Result
```ts
// Routes grouped by layout
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

### Key Improvements in the New Version

The new ElegantRouter brings multiple improvements:

1. **Simpler Data Model** - Single-level route structure is more intuitive, reducing understanding and maintenance costs
2. **More Flexible File Organization** - Removed strict directory limitations, increasing freedom in project organization
3. **Enhanced Type System** - Comprehensive type definitions and utility functions provide a better development experience
4. **Intelligent Layout Management** - Automatic grouping by layout makes managing pages with the same layout more sensible
5. **Convenient Route Tools** - Utility functions provided in shared.ts simplify route navigation operations
6. **Consistent Naming Rules** - Component import names are more intuitive and consistent with file paths
7. **Improved Extensibility** - Separated layout and component configuration lays the foundation for future feature expansion

### Version Selection Recommendations

Based on your project situation, consider the following recommendations when choosing a version:

1. **Existing Projects** - If your project already uses the old plugin and has many pages created based on its rules, consider continuing to use the old version or carefully planning migration
2. **New Projects** - Recommended to adopt the new version directly for more flexible file structure and stronger type support
3. **Special Requirements** - If your project has complex menu needs, use the new plugin to handle routes and develop independent menu generation logic

## Best Practices

To fully leverage the advantages of ElegantRouter, the following development practices are recommended:

### File Organization

- Maintain reasonable naming conventions and directory structures; while there are no strict limitations, good organization helps improve maintainability
- Organize file directories by business or functional modules to make route paths more meaningful
- For better readability, it's recommended to use `index.vue` or files with clear meaning for page components

### Route Parameter Handling

- Choose parameter types appropriately: required parameters use `[param]`, optional parameters use `[[param]]`
- Parameter names should be descriptive, avoiding overly simple or ambiguous names
- Complex parameter combinations can use multi-parameter syntax like `detail_[id]_[userId]` to improve readability

### Layout Management

- Create clear layout hierarchy structures, avoiding overly complex nesting
- Configure the `layouts` option appropriately to ensure each page has a suitable layout
- Use the `layout` property to control page layouts; pages with the same layout will be automatically grouped

### Performance Optimization

- Configure component lazy loading as needed, especially for large page components
- Large applications can split routes by functional modules to improve initial loading speed
- Use the `dynamicImport` configuration appropriately to control component import methods

### Utility Function Usage

- Make full use of utility functions provided in shared.ts for type-safe route navigation
- Use automatically generated types to enhance development experience and code quality
- Combine IDE type hints to reduce errors in route operations

By following these best practices, you can fully utilize ElegantRouter's powerful features to create efficient, maintainable routing systems.
