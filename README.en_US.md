# ElegantRouter

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/soybeanjs/elegant-router)

English | [中文](./README.md)

A file-system based automatic routing tool for Vue.js, simplifying route configuration and improving development efficiency.

> [!WARNING]
> **Note**: The code and documentation for the old version have been migrated to the [legacy branch](https://github.com/SoybeanJS/elegant-router/tree/legacy). The old version's package name was `@elegant-router/vue`, while the new version's package name is `elegant-router`. If you are using the old version or need to reference its documentation, please visit that branch.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Command Line Interface](#command-line-interface)
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

## Command Line Interface

ElegantRouter provides a command-line tool to help you quickly create, delete, and manage routes.

### Global Installation

```bash
# Install globally
npm install -g elegant-router

# Use command
er --help
```

### Local Installation

If you've already installed ElegantRouter in your project, you can use the CLI tool via npx:

```bash
npx er --help
```

### Available Commands

ElegantRouter CLI provides the following commands:

| Command        | Shorthand | Description                        |
| -------------- | --------- | ---------------------------------- |
| `er generate`  | `er -g`   | Generate route configuration files |
| `er add`       | `er -a`   | Add a new route file               |
| `er reuse`     | `er -p`   | Add a reused route file            |
| `er delete`    | `er -d`   | Delete an existing route file      |
| `er recovery`  | `er -r`   | Recover a deleted route file       |
| `er update`    | `er -u`   | Update route configuration         |
| `er backup`    | `er -b`   | Manage route backups               |
| `er --help`    | `er -h`   | Show help information              |
| `er --version` | `er -v`   | Show version information           |

### Command Details

#### `er generate` Command

Generates route configuration files based on the current file system structure. This command will:

- Scan configured page directories
- Parse file paths to generate route configurations
- Update files in the route generation directory

```bash
# Basic usage
er generate
```

#### `er add` Command

Interactively adds new route files. This command will guide you through the following steps:

1. Enter the route file path or name
2. Select the layout to use
3. Choose the page directory (if multiple are configured)

Supported file types:

- Vue Single File Components (.vue)
- TSX Components (.tsx)
- JSX Components (.jsx)

```bash
# Basic usage
er add
```

#### `er reuse` Command

Interactively add a reused route file. This command will guide you through:

1. Entering the reused route path or name
2. Selecting the layout to use
3. Selecting the page directory (if multiple are configured)

Supported file types:

- Vue Single File Component (.vue)
- TSX Component (.tsx)
- JSX Component (.jsx)

```bash
# Basic usage
er reuse
```

#### `er delete` Command

Interactively removes existing route files. This command will:

1. Display a list of all current routes
2. Let you select the route to delete
3. Delete the corresponding file
4. Update route configuration

Deleted routes are automatically backed up and can be recovered using the `recovery` command.

```bash
# Basic usage
er delete
```

#### `er recovery` Command

Recovers previously deleted route files. This command will:

1. Display a list of all recoverable routes
2. Let you select the route to recover
3. Restore the route file and configuration
4. Update route configuration

```bash
# Basic usage
er recovery
```

#### `er update` Command

Updates route configuration. This command will:

- Rescan the file system
- Update route configuration
- Maintain existing route structure

```bash
# Basic usage
er update
```

#### `er backup` Command

Manage route backups. This command provides the following features:

1. List all route backups
2. View the content of backed-up route files
3. Delete unnecessary backups

When you delete a route, the system automatically creates a backup. You can use this command to manage these backups.

```bash
# Basic usage
er backup
```

When using this command, you will see the following options:

- **List Route Backups** - Display a list of all backed-up routes and view the detailed content of each backup
- **Delete Route Backup** - Remove a specified route backup from the backup list

### Configuration File

You can create an `{er|elegant-router}.config.{js,ts,mjs,mts}` file in your project root to configure the CLI tool's behavior.

```ts
// er.config.ts
import { defineConfig } from 'elegant-router';

export default defineConfig({
  // Page directory
  pageDir: 'src/views',
  // Layout configuration
  layouts: {
    base: 'src/layouts/base/index.vue',
    blank: 'src/layouts/blank/index.vue'
  },
  // Reuse route configuration
  reuseRoutes: ['/reuse1', '/reuse2/:id', '/reuse3/:id?', '/reuse4/:id?/:name?'],
  // Default reuse route component
  defaultReuseRouteComponent: 'wip',
  // Root route redirect
  rootRedirect: '/dashboard',
  // 404 route component
  notFoundRouteComponent: 'NotFound'
});
```

### Usage Examples

#### Generate Routes

```bash
# Generate route configurations based on current file structure
er generate
```

#### Add New Route

```bash
# Interactively add a new route
er add
```

This will start an interactive command-line interface that guides you through:

1. Entering the route file path or name
2. Choosing a route layout
3. Selecting the page directory (if multiple are configured)

The CLI tool will automatically create the file and update the route configuration.

#### Delete Route

```bash
# Interactively remove a route
er delete
```

This will display a list of all current routes and let you select which one to remove. After confirmation, the CLI tool will delete the corresponding file and update the route configuration.

#### Recover Route

```bash
# Recover a deleted route
er recovery
```

This will display a list of all recoverable routes and let you select which one to recover. After confirmation, the CLI tool will restore the corresponding file and configuration.

## Build Tool Support

ElegantRouter supports various mainstream build tools to accommodate different project environment requirements. Regardless of which build tool you use, ElegantRouter provides a consistent automatic route generation experience.

### Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import ElegantRouter from 'elegant-router/vite';

export default defineConfig({
  plugins: [vue(), ElegantRouter()]
});
```

### Webpack

```ts
// webpack.config.js
const ElegantRouter = require('elegant-router/webpack');

module.exports = {
  // Other configurations...
  plugins: [new ElegantRouter()]
};
```

### Rollup

```ts
// rollup.config.js
import ElegantRouter from 'elegant-router/rollup';

export default {
  // Other configurations...
  plugins: [ElegantRouter()]
};
```

### ESBuild

```ts
// esbuild.config.js
const { build } = require('esbuild');
const ElegantRouter = require('elegant-router/esbuild');

build({
  // Other configurations...
  plugins: [ElegantRouter()]
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
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import ElegantRouter from 'elegant-router/vite';

export default defineConfig({
  plugins: [
    vue(),
    ElegantRouter() // Use default configuration
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

### Reuse Routes

If you need to reuse existing page route files, you can configure the `reuseRoutes` option:

```ts
reuseRoutes: ['/reuse1', '/reuse2/:id', '/reuse3/:id?/:name?'];
```

Reused routes use the component specified in the `defaultReuseRouteComponent` configuration (default is 'Wip').

## How It Works

### File Watching Mechanism

When starting the project, the plugin initializes a file watcher that monitors page file changes in real-time. When file additions, deletions, or renames are detected, the plugin automatically regenerates the route-related content without requiring manual intervention or service restarts. This ensures that route configurations always stay synchronized with the actual file structure, greatly enhancing the development experience.

The watcher's main features include:

- **Real-time Response** - Updates route configurations immediately after file changes
- **Intelligent Recognition** - Only processes file changes that conform to routing conventions
- **Incremental Updates** - Only regenerates affected route content, improving performance
- **Debounce Processing** - Batch file changes are processed together within a short time frame, avoiding frequent updates

The `watchFile` configuration option controls whether the file watching functionality is enabled, and the `fileUpdateDuration` option sets the debounce delay time.

### Component Name Injection

The plugin automatically injects route names into route file components, which is crucial for Vue Router's KeepAlive functionality. KeepAlive relies on component names to correctly cache and restore component states.

Supported component types:

- Vue Single File Components (.vue)
- TSX Components (.tsx)
- JSX Components (.jsx)

Injection rules:

1. If a component already has a name property, it remains unchanged
2. If a component doesn't have a name property, the route name is automatically injected
3. Route names are automatically generated based on file paths, following PascalCase naming conventions

For example, for the file `src/views/home/index.vue`, it will automatically inject:

```vue
<script setup>
const _sfc_main = {
  name: 'Home' // Automatically injected component name
  // ... other component options
};
</script>
```

For TSX/JSX components:

```tsx
export default defineComponent({
  name: 'Home', // Automatically injected component name
  setup() {
    return () => <div>Home</div>;
  }
});
```

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
   * Reuse existing route files
   *
   * @example
   *   ['/reuse1', '/reuse2/:id', '/reuse3/:id?/:name?'];
   */
  reuseRoutes?: string[];
  /**
   * The default component for reused routes
   *
   * @default 'Wip'
   */
  defaultReuseRouteComponent?: string;
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
2. **NotFound Route** - Automatically creates a wildcard route node with path '/:pathMatch(._)_' to catch all unmatched paths

These built-in routes can be used without additional configuration, as the system automatically adds them to the route list. You can customize their behavior through configuration options:

- `rootRedirect` - Set the redirect target for the root route
- `notFoundRouteComponent` - Specify the component used by the 404 route

## Version Comparison

Compared to the old version `@elegant-router/vue`, the new version `elegant-router` has made many improvements:

### System Design Improvements

| Feature         | Old Version                                                   | New Version                                                              |
| --------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Architecture    | Black-box design, route data processing logic not transparent | White-box design, route data completely transparent and accessible       |
| Processing Flow | Complex process, difficult to extend                          | Clear processing steps, easy to customize and extend                     |
| File Parsing    | Limited file parsing capabilities                             | More powerful file system parsing, supporting various naming conventions |
| Type Safety     | Basic type support                                            | Complete type definitions and automatically generated type declarations  |
| Reuse Routes    | Limited capabilities                                          | Comprehensive support for reuse routes                                   |
| Built-in Routes | Basic routes need manual configuration                        | Built-in root and 404 routes, simplifying configuration                  |

## Best Practices

To fully leverage the power of ElegantRouter, we recommend the following best practices:

### Use Built-in Routes to Simplify Configuration

Leverage ElegantRouter's built-in root and 404 routes to simplify your configuration:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import ElegantRouter from 'elegant-router/vite';

export default defineConfig({
  plugins: [vue(), ElegantRouter()]
});
```

### Combine Automatic Routes and Reuse Routes

Mix file-system-based automatic routes with reuse routes to flexibly address various scenarios:

```ts
{
  reuseRoutes: ['/reuse1', '/reuse2/:id', '/reuse3/:id?/:name?'],
  defaultReuseRouteComponent: 'Wip'
}
```

### File Organization

- Maintain a reasonable naming convention and directory structure. Although there are no strict restrictions, good organization improves maintainability.
- Organize files by business module or feature module to make route paths more meaningful.
- For better readability, it is recommended to use `index.vue` or meaningful file names for page components.

### Route Parameter Handling

- Choose parameter types appropriately: use `[param]` for required parameters and `[[param]]` for optional parameters.
- Parameter names should be descriptive and avoid being too simple or ambiguous.
- For complex parameter combinations, use multi-parameter syntax like `detail_[id]_[userId]` to improve readability.

### Layout Management

- Create a clear layout hierarchy and avoid overly complex nesting.
- Configure the `layouts` option reasonably to ensure each page has an appropriate layout.
- Use the `layout` property to control the layout of the page; pages with the same layout will be automatically grouped.

### Performance Optimization

- Configure component lazy loading as needed, especially for large page components.
- For large applications, split routes by feature module to improve initial load speed.
- Use the `dynamicImport` configuration appropriately to control how components are imported.

### Utility Functions

- Make full use of the utility functions provided in `shared.ts` for type-safe route navigation.
- Use the automatically generated types to enhance development experience and code quality.
- Combine with IDE type hints to reduce errors in route operations.

By following these best practices, you can fully utilize ElegantRouter's powerful features to create efficient and maintainable routing systems.
