# ElegantRouter

中文 | [English](./README.en_US.md)

基于文件系统的 Vue.js 自动路由生成工具，简化路由配置，提升开发效率。

> [!WARNING]
> **注意**: 旧版本的代码和文档已迁移至 [legacy 分支](https://github.com/SoybeanJS/elegant-router/tree/legacy)。旧版本的包名为 `@elegant-router/vue`，而新版本的包名为 `elegant-router`。如果您正在使用旧版本或需要参考旧版本的文档，请访问该分支。


## 目录

- [介绍](#介绍)
- [安装](#安装)
- [命令行工具](#命令行工具)
- [构建工具支持](#构建工具支持)
- [快速开始](#快速开始)
- [路由创建约定](#路由创建约定)
- [工作原理](#工作原理)
- [配置选项](#配置选项)
- [新旧版本对比](#新旧版本对比)
- [最佳实践](#最佳实践)

## 介绍

ElegantRouter 是一款为 Vue.js 应用设计的创新路由管理工具，专为简化 Vue Router 的配置而设计。它基于文件系统结构自动生成路由，消除了手动配置路由的繁琐过程，使开发人员能够专注于应用功能的实现。

通过 ElegantRouter，您只需按照约定的命名规则创建 Vue 页面文件，系统会自动：

- 解析文件路径生成路由路径
- 创建直观的路由名称
- 处理嵌套路由和参数路由
- 管理布局与页面的关系
- 生成完整的类型定义

这种基于约定的路由生成方式不仅提高了开发效率，还增强了项目的可维护性和可扩展性。无需在单独的配置文件中手动定义每个路由，路由结构会随着文件系统的变化自动更新，确保路由配置与实际页面结构保持同步。

### 背景

传统 Vue Router 配置方式通常需要开发者手动完成多个步骤：导入布局组件、导入页面组件、定义路由配置等。这些步骤虽然简单，但在大型项目中会变得繁琐且容易出错。特别是当需要维护大量路由时，路由名称和路径的一致性维护成为一项挑战，容易导致路由定义混乱和难以管理。

ElegantRouter 旨在解决这些问题，通过基于文件系统的约定简化 Vue 应用的路由配置过程。与其他类似工具相比，ElegantRouter 的独特优势在于：

1. **简化配置** - 其他工具往往有繁多的配置规则，且路由数据作为黑盒难以自定义；而 ElegantRouter 采用白盒设计，使路由数据透明且易于扩展。

2. **API 优先** - 遵循 API-first 原则，将路由配置过程完全自动化，减少手动干预。

使用 ElegantRouter，只需按照约定创建文件，系统会自动识别并生成对应的路由配置，极大提高了 Vue 应用开发效率并降低了维护成本。

### 特性

ElegantRouter 提供了一系列强大的特性，使路由管理变得简单高效：

- **文件系统驱动** - 无需手动配置，路由结构直接从文件系统派生，减少维护工作
- **透明数据结构** - 路由数据完全透明，便于调试和自定义扩展
- **类型安全导航** - 自动生成类型定义文件，提供完整的类型推断和智能提示
- **灵活配置能力** - 提供丰富的配置选项，满足各种复杂场景需求
- **智能布局管理** - 自动处理布局与页面组件的关系，简化嵌套路由的创建
- **性能优化设计** - 内置代码分割和懒加载支持，优化应用性能

### 核心功能

ElegantRouter 的核心功能设计围绕简化开发流程和提高效率：

1. **路由自动生成** - 从文件系统自动生成完整的路由配置，包括路径、名称和嵌套关系
2. **类型定义生成** - 创建类型声明文件，确保路由操作的类型安全
3. **组件导入优化** - 处理组件的动态导入和代码分割，提升应用性能
4. **布局系统集成** - 简化布局与页面组件的关联，自动处理嵌套路由
5. **路由转换能力** - 将简洁的一级路由结构转换为框架所需的嵌套路由结构

## 安装

使用包管理器安装 ElegantRouter：

```bash
pnpm install elegant-router
```

## 命令行工具

ElegantRouter 提供了命令行工具，可以帮助您快速创建、删除和管理路由。

### 全局安装

```bash
# 全局安装
npm install -g elegant-router

# 使用命令
er --help
```

### 本地安装

如果您已经在项目中安装了 ElegantRouter，可以通过 npx 使用命令行工具：

```bash
npx er --help
```

### 可用命令

ElegantRouter CLI 提供以下命令：

| 命令 | 简写 | 描述 |
|------|------|------|
| `er generate` | `er -g` | 生成路由配置文件 |
| `er add` | `er -a` | 添加新路由文件 |
| `er reuse` | `er -p` | 添加复用路由文件 |
| `er delete` | `er -d` | 删除现有路由文件 |
| `er recovery` | `er -r` | 恢复已删除的路由文件 |
| `er update` | `er -u` | 更新路由配置 |
| `er backup` | `er -b` | 管理路由备份 |
| `er --help` | `er -h` | 显示帮助信息 |
| `er --version` | `er -v` | 显示版本信息 |

### 命令详细说明

#### `er generate` 命令

根据当前文件系统结构生成路由配置文件。这个命令会：
- 扫描配置的页面目录
- 解析文件路径生成路由配置
- 更新路由生成目录下的文件

```bash
# 基本用法
er generate
```

#### `er add` 命令

交互式添加新的路由文件。这个命令会引导您完成以下步骤：
1. 输入路由文件路径或名称
2. 选择要使用的布局
3. 选择页面目录（如果配置了多个）

支持的文件类型：
- Vue 单文件组件 (.vue)
- TSX 组件 (.tsx)
- JSX 组件 (.jsx)

```bash
# 基本用法
er add
```

#### `er delete` 命令

交互式删除现有的路由文件。这个命令会：
1. 显示当前所有路由列表
2. 让您选择要删除的路由
3. 删除对应的文件
4. 更新路由配置

删除的路由会被自动备份，可以通过 `recovery` 命令恢复。

```bash
# 基本用法
er delete
```

#### `er recovery` 命令

恢复之前删除的路由文件。这个命令会：
1. 显示所有可恢复的路由列表
2. 让您选择要恢复的路由
3. 恢复路由文件和配置
4. 更新路由配置

```bash
# 基本用法
er recovery
```

#### `er update` 命令

更新路由配置。这个命令会：
- 重新扫描文件系统
- 更新路由配置
- 保持现有的路由结构

```bash
# 基本用法
er update
```

#### `er backup` 命令

管理路由备份。这个命令提供了以下功能：
1. 列出所有路由备份
2. 查看备份的路由文件内容
3. 删除不需要的备份

当您删除路由时，系统会自动创建备份。您可以使用此命令来管理这些备份。

```bash
# 基本用法
er backup
```

使用此命令时，您将看到以下选项：
- **列出路由备份** - 显示所有备份的路由列表，并可以查看每个备份的详细内容
- **删除路由备份** - 从备份列表中删除指定的路由备份

### 配置文件

您可以在项目根目录创建 `{er|elegant-router}.config.{js,ts,mjs,mts}` 文件来配置 CLI 工具的行为。

```ts
// er.config.config.ts
import { defineConfig } from 'elegant-router';

export default defineConfig({
  // 页面目录
  pageDir: 'src/views',
  // 布局配置
  layouts: {
    base: 'src/layouts/base/index.vue',
    blank: 'src/layouts/blank/index.vue'
  },
  // 复用路由配置
  reuseRoutes: ['/reuse1', '/reuse2/:id', '/reuse3/:id?', '/reuse4/:id?/:name?'],
  // 默认复用路由组件
  defaultReuseRouteComponent: 'wip',
  // 根路由重定向
  rootRedirect: '/dashboard',
  // 404 路由组件
  notFoundRouteComponent: 'NotFound',
});
```

### 使用示例

#### 生成路由

```bash
# 根据当前文件结构生成路由配置
er generate
```

#### 添加新路由

```bash
# 交互式添加新路由
er add
```

这将启动交互式命令行界面，引导您：
1. 输入路由文件路径或名称
2. 选择路由布局
3. 选择页面目录（如果配置了多个）

CLI 工具会自动创建文件并更新路由配置。

#### 删除路由

```bash
# 交互式删除路由
er delete
```

这将显示当前所有路由列表，让您选择要删除的路由。确认后，CLI 工具会删除相应的文件并更新路由配置。

#### 恢复路由

```bash
# 恢复已删除的路由
er recovery
```

这将显示所有可恢复的路由列表，让您选择要恢复的路由。确认后，CLI 工具会恢复相应的文件和配置。

## 构建工具支持

ElegantRouter 支持多种主流构建工具，以适应不同的项目环境需求。无论您使用哪种构建工具，ElegantRouter 都能提供一致的路由自动生成体验。

### Vite

```ts
// vite.config.ts
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

### Webpack

```ts
// webpack.config.js
const ElegantRouter = require('elegant-router/webpack');

module.exports = {
  // 其他配置...
  plugins: [new ElegantRouter()],
};
```

### Rollup

```ts
// rollup.config.js
import ElegantRouter from 'elegant-router/rollup';

export default {
  // 其他配置...
  plugins: [ElegantRouter()],
};
```

### ESBuild

```ts
// esbuild.config.js
const { build } = require('esbuild');
const ElegantRouter = require('elegant-router/esbuild');

build({
  // 其他配置...
  plugins: [ElegantRouter()],
});
```

### UnPlugins 通用接口

ElegantRouter 还提供了 UnPlugins 通用接口，可以在支持 UnPlugins 的构建工具中使用：

```ts
import { createUnplugin } from 'elegant-router/unplugin';

const ElegantRouterUnplugin = createUnplugin({
  // 配置选项
});

// 然后根据不同构建工具使用相应的方法
// ElegantRouterUnplugin.vite()
// ElegantRouterUnplugin.webpack()
// ElegantRouterUnplugin.rollup()
// 等等...
```

## 快速开始

### 在 Vite 项目中配置

将 ElegantRouter 插件添加到您的 Vite 配置中：

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ElegantRouter from "elegant-router/vite";

export default defineConfig({
  plugins: [
    vue(),
    ElegantRouter(),  // 使用默认配置
  ]
});
```

### 与 Vue Router 集成

在路由文件中引入生成的路由数据：

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './_generated/routes';
import { layouts, views } from './_generated/imports';
import { transformToVueRoutes } from './_generated/transformer';

// 转换路由
const vueRoutes = transformToVueRoutes(routes, layouts, views);

const router = createRouter({
  history: createWebHistory(),
  routes: vueRoutes
});

export default router;
```

## 路由创建约定

ElegantRouter 基于文件系统约定创建路由，遵循简单直观的规则。新版本设计更加灵活，不强制目录结构，但提供清晰的文件命名约定。

### 基础路由

创建普通页面组件，自动生成对应路由：

**文件路径:** `src/views/home/index.vue`

**生成路由:**
```ts
{
  name: 'Home',
  path: '/home',
  layout: 'base',
  component: 'Home'
}
```

> `layout` 属性指定页面使用的布局组件，`component` 属性标识视图组件。转换器会根据这些信息构建最终的嵌套路由结构。

> 您可以在生成的路由对象上添加其他属性，如 `meta`, `props`, `beforeEnter` 等，以满足特定需求。

### 参数路由

使用方括号语法创建带参数的路由：

**文件路径:** `src/views/list/[id].vue`

**生成路由:**
```ts
{
  name: 'ListId',
  path: '/list/:id',
  layout: 'base',
  component: 'ListId'
}
```

### 可选参数路由

使用双方括号语法创建带可选参数的路由：

**文件路径:** `src/views/list/detail-[[id]]-[[userId]].vue`

**生成路由:**
```ts
{
  name: 'ListDetailIdUserId',
  path: '/list/detail-:id?-:userId?',
  layout: 'base',
  component: 'ListDetailIdUserId'
}
```

### 多参数路由

使用下划线分隔多个参数：

**文件路径:** `src/views/list/detail_[id]_[userId].vue`

**生成路由:**
```ts
{
  name: 'ListDetailIdUserId',
  path: '/list/detail/:id/:userId',
  layout: 'base',
  component: 'ListDetailIdUserId'
}
```

### 分组路由

使用圆括号创建不影响路由路径的分组：

**文件路径:** `src/views/(group)/demo/index.vue`

**生成路由:**
```ts
{
  name: 'Demo',
  path: '/demo',
  component: 'Demo'
}
```

### 复用路由

需要复用已有的页面路由文件，可以通过配置 `reuseRoutes` 选项来实现：

#### 配置方式

在配置文件 `er.config.ts` 中配置：

```ts
{
  reuseRoutes: [
    '/reuse1',
    '/reuse2/:id',
    '/reuse3/:id?',
    '/reuse4/:id?/:name?'
  ]
}
```

#### 路由结果

```ts
  {
    name: 'Reuse1',
    path: '/reuse1',
    layout: 'base',
    component: 'Wip', // 现有文件的组件
    meta: {
      title: "Reuse1"
    }
  },
  {
    name: 'Reuse2Id',
    path: '/reuse2/:id',
    layout: 'base',
    component: 'Wip',
    meta: {
      title: "Reuse2Id"
    }
  },
  {
    name: 'Reuse3Id',
    path: '/reuse3/:id?',
    layout: 'base',
    component: 'Wip',
    meta: {
      title: "Reuse3Id"
    }
  },
  {
    name: 'Reuse4IdName',
    path: '/reuse4/:id?/:name?',
    layout: 'base',
    component: 'Wip',
    meta: {
      title: "Reuse4IdName"
    }
  },

```

系统会自动根据路径生成路由名称，遵循以下规则：
1. 将路径转换为 PascalCase 格式
2. 移除特殊字符和参数标记
3. 对于参数路由，保留参数名称作为路由名称的一部分

例如：
- `/dashboard` -> `Dashboard`
- `/user/profile` -> `UserProfile`
- `/user/:id/profile` -> `UserIdProfile`

## 工作原理

### 文件监听机制

在启动项目时，插件会初始化文件监听器，实时监控页面文件的变化。当检测到文件有新增、删除或重命名操作时，插件会自动重新生成路由相关内容，无需手动干预或重启服务。这确保了路由配置始终与实际文件结构保持同步，极大提升了开发体验。

监听器的主要功能包括：

- **实时响应** - 文件变化后立即更新路由配置
- **智能识别** - 只处理符合路由约定的文件变化
- **增量更新** - 仅重新生成受影响的路由内容，提高性能
- **防抖处理** - 批量文件变化会在短时间内合并处理，避免频繁更新

通过 `watchFile` 配置项可以控制是否启用文件监听功能，`fileUpdateDuration` 配置项则用于设置防抖延迟时间。

### 组件名称注入

插件会自动将路由名称注入到路由文件组件中，这对于 Vue Router 的 KeepAlive 功能至关重要。KeepAlive 依赖于组件名称来正确缓存和恢复组件状态。

支持的组件类型：
- Vue 单文件组件 (.vue)
- TSX 组件 (.tsx)
- JSX 组件 (.jsx)

注入规则：
1. 如果组件已有 name 属性，则保持不变
2. 如果组件没有 name 属性，则自动注入路由名称
3. 路由名称基于文件路径自动生成，遵循 PascalCase 命名规范

例如，对于文件 `src/views/home/index.vue`，会自动注入：
```vue
<script setup>
const _sfc_main = {
  name: 'Home',  // 自动注入的组件名称
  // ... 其他组件选项
}
</script>
```

对于 TSX/JSX 组件：
```tsx
export default defineComponent({
  name: 'Home',  // 自动注入的组件名称
  setup() {
    return () => <div>Home</div>;
  }
});
```

### 生成的文件结构

启动项目后，ElegantRouter 会在配置的目录（默认为 `src/router/_generated`）下生成以下文件：

1. **routes.ts** - 存储基于文件系统生成的完整路由配置
2. **imports.ts** - 包含所有布局和视图组件的自动导入语句
3. **transformer.ts** - 提供路由转换函数，将一级路由转换为框架所需的嵌套结构
4. **shared.ts** - 提供类型安全的路由工具函数，便于在代码中引用路由

### 路由转换流程

ElegantRouter 采用一级路由到嵌套路由的转换流程，简化路由管理：

```ts
// 生成的一级路由（简洁直观）
{
  name: 'Home',
  path: '/home',
  layout: 'base',
  component: 'Home'
}

// 转换后的嵌套路由（按布局分组）
{
  path: '/base-layout',
  component: () => import('@/layouts/base/index.vue'),
  children: [
    {
      name: 'Home',
      path: '/home',
      component: () => import('@/views/home/index.vue')
    }
    // ...同一布局下的其他路由
  ]
}
```

## 配置选项

ElegantRouter 提供了丰富的配置选项，使您能够根据项目需求自定义路由生成行为：

```ts
interface AutoRouterOptions {
  /**
   * 项目根目录
   *
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * 是否监听文件
   *
   * @default true
   */
  watchFile?: boolean;
  /**
   * 文件更新时间
   *
   * @default 500 ms
   */
  fileUpdateDuration?: number;
  /**
   * 页面目录
   *
   * @default "['src/views']"
   */
  pageDir?: MaybeArray<string>;
  /**
   * 页面 glob
   *
   * @default '**/*.vue'
   */
  pageInclude?: MaybeArray<string>;
  /**
   * 页面 glob 排除
   *
   * @default ['**/components/**', '**/modules/**']
   */
  pageExclude?: MaybeArray<string>;
  /**
   * 生成的路由类型声明文件路径
   *
   * @default 'src/typings/elegant-router.d.ts'
   */
  dts?: string;
  /**
   * vue-router 类型声明文件路径
   *
   * @default 'src/typings/typed-router.d.ts'
   */
  vueRouterDts?: string;
  /**
   * tsconfig 文件路径
   *
   * @default 'tsconfig.json'
   */
  tsconfig?: string;
  /**
   * 项目别名
   *
   * @default 'get the alias from the tsconfig'
   */
  alias?: Record<string, string>;
  /**
   * 路由自动生成的目录
   *
   * @default 'src/router/_generated'
   */
  routerGeneratedDir?: string;
  /**
   * 路由布局
   *
   * @default "{
   *  base: 'src/layouts/base/index.vue',
   *  blank: 'src/layouts/blank/index.vue',
   * }"
   */
  layouts?: Record<string, string>;
  /**
   * 布局懒加载
   *
   * @default true
   */
  layoutLazy?: (layout: string) => boolean;
  /**
   * 复用已存在文件的路由
   *
   * @example
   *   ['/reuse1', '/reuse2/:id', '/reuse3/:id?/:name?'];
   */
  reuseRoute?: string[];
  /**
   * 复用路由的默认组件
   *
   * @default 'Wip'
   */
  defaultReuseRouteComponent?: string;
  /**
   * 根路由重定向路径
   *
   * @default '/home'
   */
  rootRedirect?: string;
  /**
   * 404 路由组件
   *
   * @default '404'
   */
  notFoundRouteComponent?: string;
  /**
   * 路由路径获取函数
   *
   * @default 'src/router/auto-router'
   */
  getRoutePath?: (node: AutoRouterNode) => string;
  /**
   * 路由名称获取函数
   *
   * @default transform the path to the route name
   */
  getRouteName?: (node: AutoRouterNode) => string;
  /**
   * 路由布局获取函数
   *
   * @default get the first key of the layouts
   */
  getRouteLayout?: (node: AutoRouterNode) => string;
  /**
   * 路由懒加载函数
   *
   * @default true
   */
  routeLazy?: (node: AutoRouterNode) => boolean;
  /**
   * 生成路由的 meta 函数, 只会覆盖不存在的 meta 属性
   *
   * @example
   *   ```ts
   *     getRouteMeta: (node) => {
   *       return {
   *         title: node.name
   *       }
   *     }
   *   ```;
   */
  getRouteMeta?: (node: AutoRouterNode) => Record<string, any> | null;
}
```

### 内置路由

ElegantRouter 现在提供了内置的基础路由支持，包括：

1. **根路由 (Root)** - 自动创建路径为 '/' 的根路由节点
2. **404路由 (NotFound)** - 自动创建路径为 '/:pathMatch(.*)*' 的通配符路由节点，用于捕获所有不匹配的路径

这些内置路由无需额外配置即可使用，系统会自动将它们添加到路由列表中。您可以通过配置选项自定义它们的行为：

- `rootRedirect` - 设置根路由的重定向目标
- `notFoundRouteComponent` - 指定 404 路由使用的组件

### 复用路由

除了基于文件系统的路由外，ElegantRouter 还支持创建复用现有文件的路由：

```ts
reuseRoutes: ['/reuse1', '/reuse2/:id', '/reuse3/:id?/:name?']
```

复用路由默认使用 `defaultReuseRouteComponent` 配置中指定的组件（默认为 'Wip'）。

## 新旧版本对比

与旧版本 `@elegant-router/vue` 相比，新版本 `elegant-router` 进行了许多改进：

### 系统设计的改进

| 功能 | 旧版本 | 新版本 |
|-----|-------|-------|
| 架构设计 | 黑盒设计，路由数据处理逻辑不透明 | 白盒设计，路由数据完全透明可访问 |
| 处理流程 | 复杂的流程，难以扩展 | 清晰的处理步骤，便于自定义和扩展 |
| 文件解析 | 受限的文件解析能力 | 更强大的文件系统解析，支持多种命名约定 |
| 类型安全 | 基本的类型支持 | 完整的类型定义和自动生成的类型声明 |
| 复用路由 | 有限的能力 | 全面支持复用路由 |
| 内置路由 | 需要手动配置基础路由 | 内置根路由和404路由，简化配置 |

### 技术实现变化

#### 旧版本实现
- **组件关联方式**：使用特殊字符串（如 `layout.base$view.about`）表示组件关系
- **路由数据结构**：生成复杂的嵌套路由结构，再转换为框架需要的格式
- **生成文件范围**：生成基础的 imports.ts、routes.ts、transform.ts 三个文件

#### 新版本实现
- **组件关联方式**：使用独立的 `layout` 和 `component` 字段清晰表示组件关系
- **路由数据结构**：生成简洁的一级路由结构，通过转换器按布局分组
- **工具函数增强**：新增 shared.ts 提供路由名称和路径映射工具
- **类型支持优化**：提供更全面的类型定义，增强开发体验

### 路由数据结构对比

#### 旧版本路由示例
```ts
// 单级路由
{
  name: 'about',
  path: '/about',
  component: 'layout.base$view.about',
  meta: { title: 'about' }
}

// 多级路由
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

#### 新版本路由示例
```ts
// 统一的一级路由结构
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

### 转换后的路由结构对比

#### 旧版本转换结果
```ts
// 单级路由转换后
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

// 多级路由转换后
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

#### 新版本转换结果
```ts
// 按布局分组的路由结构
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
    // ...同一布局下的其他路由
  ]
}
```

### 新版本的主要改进

新版 ElegantRouter 带来了多方面的提升：

1. **更简洁的数据模型** - 一级路由结构更直观，减少理解和维护成本
2. **更灵活的文件组织** - 移除了严格的目录限制，提高了项目组织的自由度
3. **增强的类型系统** - 完善的类型定义和工具函数，提供更好的开发体验
4. **智能的布局管理** - 按布局自动分组，使同一布局下的页面管理更合理
5. **便捷的路由工具** - 通过 shared.ts 提供的工具函数，简化路由导航操作
6. **一致的命名规则** - 组件导入名称更直观，与文件路径保持一致
7. **扩展性增强** - 分离的布局和组件配置，为未来功能扩展奠定基础

### 版本选择建议

根据项目情况，您可以参考以下建议选择合适的版本：

1. **现有项目** - 如果您的项目已使用旧版插件且有大量页面基于其规则创建，建议继续使用旧版或谨慎规划迁移
2. **新项目** - 推荐直接采用新版插件，以获得更灵活的文件结构和更强大的类型支持
3. **特殊需求** - 如果项目有复杂的菜单需求，可以使用新版插件处理路由，并自行开发独立的菜单生成逻辑

## 最佳实践

为了充分发挥 ElegantRouter 的优势，推荐以下开发实践：

### 使用内置路由简化配置

利用 ElegantRouter 内置的根路由和 404 路由简化配置：

```ts
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ElegantRouter from "elegant-router/vite";

export default defineConfig({
  plugins: [
    vue(),
    ElegantRouter()
  ]
});
```

### 组合使用自动路由和复用路由

混合使用基于文件系统的自动路由和复用路由，灵活应对各种场景：

```ts
{
  reuseRoutes: ['/reuse1', '/reuse2/:id', '/reuse3/:id?/:name?']
  defaultReuseRouteComponent: 'Wip'
}
```

### 文件组织

- 保持合理的命名规范和目录结构，虽然不再有严格限制，但良好的组织有助于提高可维护性
- 根据业务模块或功能模块组织文件目录，可以使路由路径更有意义
- 为提高可读性，建议页面组件使用 `index.vue` 或有明确含义的文件名

### 路由参数处理

- 合理选择参数类型：必选参数使用 `[param]`，可选参数使用 `[[param]]`
- 参数命名应具有描述性，避免使用过于简单或模糊的名称
- 复杂的参数组合可以使用多参数语法 `detail_[id]_[userId]` 来提高可读性

### 布局管理

- 创建清晰的布局层次结构，避免过于复杂的嵌套
- 合理配置 `layouts` 选项，确保每个页面都有适当的布局
- 利用 `layout` 属性控制页面的布局，相同布局的页面会自动分组

### 性能优化

- 根据需要配置组件懒加载，特别是对于大型页面组件
- 大型应用可以按功能模块拆分路由，提高初始加载速度
- 合理使用 `dynamicImport` 配置，控制组件导入方式

### 工具函数使用

- 充分利用 shared.ts 中提供的工具函数进行类型安全的路由导航
- 使用自动生成的类型来增强开发体验和代码质量
- 结合 IDE 的类型提示功能，减少路由操作中的错误

通过遵循这些最佳实践，您可以充分发挥 ElegantRouter 的强大功能，创建高效、可维护的路由系统。