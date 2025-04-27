# ElegantRouter

基于文件系统的 Vue.js 自动路由生成工具，简化路由配置，提升开发效率。

> [!WARNING]
> **注意**: 旧版本的代码和文档已迁移至 [legacy 分支](https://github.com/SoybeanJS/elegant-router/tree/legacy)。旧版本的包名为 `@elegant-router/vue`，而新版本的包名为 `elegant-router`。如果您正在使用旧版本或需要参考旧版本的文档，请访问该分支。

中文 | [English](./README.en_US.md)

## 目录

- [介绍](#介绍)
- [安装](#安装)
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
    ElegantRouter({
      // 配置选项
    }),
  ]
});
```

### Webpack

```ts
// webpack.config.js
const ElegantRouter = require('elegant-router/webpack');

module.exports = {
  // 其他配置...
  plugins: [
    new ElegantRouter({
      // 配置选项
    })
  ]
};
```

### Rollup

```ts
// rollup.config.js
import ElegantRouter from 'elegant-router/rollup';

export default {
  // 其他配置...
  plugins: [
    ElegantRouter({
      // 配置选项
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
  // 其他配置...
  plugins: [
    ElegantRouter({
      // 配置选项
    })
  ]
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

### 自定义路由

对于特殊需求，支持配置自定义路由：

#### 配置方式

```ts
ElegantRouter({
  customRoutes: {
    'CustomRoute': '/custom-route',
    'NotFound': '/:pathMatch(.*)*'
  },
});
```

#### 路由结果

```ts
{
  name: "CustomRoute",
  path: "/custom-route",
  layout: "base",
  component: "wip", // 使用已有的页面路由文件
}
```

## 工作原理

### 文件监听机制

在启动项目时，插件会初始化文件监听器，实时监控页面文件的变化。当检测到文件有新增、删除或重命名操作时，插件会自动重新生成路由相关内容，无需手动干预或重启服务。这确保了路由配置始终与实际文件结构保持同步，极大提升了开发体验。

监听器的主要功能包括：

- **实时响应** - 文件变化后立即更新路由配置
- **智能识别** - 只处理符合路由约定的文件变化
- **增量更新** - 仅重新生成受影响的路由内容，提高性能
- **防抖处理** - 批量文件变化会在短时间内合并处理，避免频繁更新

通过 `watchFile` 配置项可以控制是否启用文件监听功能，`fileUpdateDuration` 配置项则用于设置防抖延迟时间。

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

ElegantRouter 提供丰富的配置选项，满足各种项目需求：

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import ElegantRouter from 'elegant-router/vite';

export default defineConfig({
  plugins: [
    vue(),
    ElegantRouter({
      // 项目根目录
      cwd: process.cwd(),

      // 是否监听文件变化
      watchFile: true,

      // 文件更新时间（毫秒）
      fileUpdateDuration: 500,

      // 页面目录（可以指定多个）
      pageDir: ['src/pages', 'src/views'],

      // 页面文件匹配规则
      pageInclude: '**/*.vue',

      // 排除的页面文件
      pageExclude: ['**/components/**', '**/modules/**'],

      // 类型定义文件路径
      dts: 'src/typings/elegant-router.d.ts',

      // vue-router 类型定义文件路径
      vueRouterDts: 'src/typings/typed-router.d.ts',

      // tsconfig 文件路径
      tsconfig: 'tsconfig.json',

      // 项目别名配置，默认从 tsconfig 的 compilerOptions.paths 中解析出别名
      alias: {},

      // 路由生成目录
      routerGeneratedDir: 'src/router/_generated',

      // 布局配置
      layouts: {
        base: 'src/layouts/base/index.vue',
        blank: 'src/layouts/blank/index.vue'
      },

      // 布局组件是否懒加载
      layoutLazy: (layout) => true,

      // 自定义路由（名称:路径）
      customRoute: {
        Root: '/',
        NotFound: '/:pathMatch(.*)*'
      },

      // 根路由重定向路径
      rootRedirect: '/home',

      // 404 路由组件
      notFoundRouteComponent: '404',

      // 默认自定义路由组件
      defaultCustomRouteComponent: 'wip',

      // 自定义路由路径生成
      getRoutePath: (node) => node.path,

      // 自定义路由名称生成
      getRouteName: (node) => node.name,

      // 自定义路由布局
      getRouteLayout: (node) => node.layout,

      // 路由组件是否懒加载
      routeLazy: (node) => true
    })
  ]
});
```

## 新旧版本对比

ElegantRouter 经过重大升级，新版本在设计理念和实现方式上都有显著变化，以提供更好的开发体验。

### 设计理念演进

|   | 旧版本 | 新版本 |
|---|--------|--------|
| **路由与菜单** | 强耦合设计，路由和菜单数据紧密关联 | 完全解耦，专注于路由生成，菜单可独立配置 |
| **目录结构** | 严格限制，如禁止子目录同时拥有同级 index.vue | 更加灵活，无严格限制，专注于文件命名约定 |
| **路由模型** | 多级嵌套结构，需要复杂转换 | 简洁的一级结构，按布局分组转换 |
| **数据透明度** | 中间数据不易理解和调试 | 完全透明的白盒设计，易于理解和扩展 |

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