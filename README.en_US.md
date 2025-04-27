# ElegantRouter

A file-system based automatic routing tool for Vue.js, simplifying route configuration and improving development efficiency.

> [!WARNING]
> **Note**: The code and documentation for the old version have been migrated to the [legacy branch](https://github.com/SoybeanJS/elegant-router/tree/legacy). The old version's package name was `@elegant-router/vue`, while the new version's package name is `elegant-router`. If you are using the old version or need to reference its documentation, please visit that branch.

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

ElegantRouter provides rich configuration options that allow you to customize the route generation behavior according to your project requirements:

```ts
interface AutoRouterOptions {
  /**
   * The root directory of the project
   *
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * Whether to watch the file
   *
   * @default true
   */
  watchFile?: boolean;
  /**
   * The duration of the file update
   *
   * @default 500 ms
   */
  fileUpdateDuration?: number;
  /**
   * The directory of the pages
   *
   * @default "['src/views']"
   */
  pageDir?: MaybeArray<string>;
  /**
   * The glob of the pages
   *
   * @default '**/*.vue'
   */
  pageInclude?: MaybeArray<string>;
  /**
   * The glob of the pages to exclude
   *
   * @default ['**/components/**', '**/modules/**']
   */
  pageExclude?: MaybeArray<string>;
  /**
   * The path of the dts file
   *
   * @default 'src/typings/elegant-router.d.ts'
   */
  dts?: string;
  /**
   * The path of the vue-router dts file
   *
   * @default 'src/typings/typed-router.d.ts'
   */
  vueRouterDts?: string;
  /**
   * The path of the tsconfig file
   *
   * @default 'tsconfig.json'
   */
  tsconfig?: string;
  /**
   * The alias of the project
   *
   * @default 'get the alias from the tsconfig'
   */
  alias?: Record<string, string>;
  /**
   * The directory of the router generated
   *
   * @default 'src/router/_generated'
   */
  routerGeneratedDir?: string;
  /**
   * The layouts of the router
   *
   * @default "{
   *  base: 'src/layouts/base/index.vue',
   *  blank: 'src/layouts/blank/index.vue',
   * }"
   */
  layouts?: Record<string, string>;
  /**
   * The lazy of the layout
   *
   * @default true
   */
  layoutLazy?: (layout: string) => boolean;
  /**
   * Custom route configuration
   *
   * You can configure name-to-path mappings via map, or provide a list of paths via paths
   * The system will automatically create corresponding route nodes for each path
   *
   * @example
   *   ```ts
   *   customRoute: {
   *     map: {
   *       Home: '/home',
   *       About: '/about'
   *     },
   *     paths: ['/home2', '/about2']
   *   }
   *   ```
   */
  customRoute?: Partial<CustomRoute>;
  /**
   * The root redirect path
   *
   * @default '/home'
   */
  rootRedirect?: string;
  /**
   * The not found route component
   *
   * @default '404'
   */
  notFoundRouteComponent?: string;
  /**
   * The default custom route component
   *
   * @default 'wip'
   */
  defaultCustomRouteComponent?: string;
  /**
   * The path of the route
   *
   * @default 'src/router/auto-router'
   */
  getRoutePath?: (node: AutoRouterNode) => string;
  /**
   * The name of the route
   *
   * @default transform the path to the route name
   */
  getRouteName?: (node: AutoRouterNode) => string;
  /**
   * The layout of the route, used by `getRouteLayout`
   *
   * If set, it will find the layout by the route filepath
   */
  routeLayoutMap?: Record<string, string>;
  /**
   * The layout of the route
   *
   * @default get the first key of the layouts
   */
  getRouteLayout?: (node: AutoRouterNode) => string;
  /**
   * The lazy of the route
   *
   * @default true
   */
  routeLazy?: (node: AutoRouterNode) => boolean;
}
```

### Built-in Routes

ElegantRouter now provides built-in support for basic routes, including:

1. **Root Route** - Automatically creates a root route node with path '/'
2. **NotFound Route** - Automatically creates a wildcard route node with path '/:pathMatch(.*)*' to catch all unmatched paths

These built-in routes can be used without additional configuration, as the system automatically adds them to the route list. You can customize their behavior through configuration options:

- `rootRedirect` - Set the redirect target for the root route
- `notFoundRouteComponent` - Specify the component used by the 404 route

### Custom Routes

In addition to file-system-based routes, ElegantRouter supports creating custom routes in two ways:

1. **Via Mapping Table** - Use `customRoute.map` to configure the name-to-path mapping relationship:

```ts
customRoute: {
  map: {
    Dashboard: '/dashboard',
    UserProfile: '/user/profile'
  }
}
```

2. **Via Path List** - Use `customRoute.paths` to provide a list of paths, and the system will automatically derive route names:

```ts
customRoute: {
  paths: ['/settings', '/user/settings']
}
```

Custom routes use the component specified in the `defaultCustomRouteComponent` configuration (default is 'wip').

## Version Comparison

Compared to the old version `@elegant-router/vue`, the new version `elegant-router` has made many improvements:

### System Design Improvements

| Feature | Old Version | New Version |
|---------|------------|-------------|
| Architecture | Black-box design, route data processing logic not transparent | White-box design, route data completely transparent and accessible |
| Processing Flow | Complex process, difficult to extend | Clear processing steps, easy to customize and extend |
| File Parsing | Limited file parsing capabilities | More powerful file system parsing, supporting various naming conventions |
| Type Safety | Basic type support | Complete type definitions and automatically generated type declarations |
| Custom Routes | Limited customization capabilities | Comprehensive support for custom routes, including mapping tables and path lists |
| Built-in Routes | Basic routes need manual configuration | Built-in root and 404 routes, simplifying configuration |

## Best Practices

### Simplify Configuration with Built-in Routes

Leverage ElegantRouter's built-in root and 404 routes to simplify configuration:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ElegantRouter from "elegant-router/vite";

export default defineConfig({
  plugins: [
    vue(),
    ElegantRouter({
      rootRedirect: '/dashboard', // Custom root route redirect
      notFoundRouteComponent: 'NotFound' // Custom 404 component name
    })
  ]
});
```

### Combine Automatic Routes with Custom Routes

Mix file-system-based automatic routes with custom routes to flexibly address various scenarios:

```ts
ElegantRouter({
  customRoute: {
    map: {
      Dashboard: '/dashboard',
      Settings: '/settings'
    },
    paths: [
      '/profile',
      '/account/details'
    ]
  },
  defaultCustomRouteComponent: 'WorkInProgress'
})
```

By following these best practices, you can fully utilize ElegantRouter's powerful features to create efficient, maintainable routing systems.
