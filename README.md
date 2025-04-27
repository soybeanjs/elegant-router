# ElegantRouter

基于文件系统的自动路由生成工具，简化路由配置，提升开发效率。

中文 | [English](./README.en_US.md)

## 介绍

Elegant Router 是一个基于文件系统创建路由的工具，它能自动化生成路由定义、路由文件导入以及路由相关的类型定义。只需按照约定的规则创建路由文件，无需在路由文件中添加任何额外配置。

### 背景

ElegantRouter 与其他基于文件系统的路由工具的主要区别在于：

1. 其他工具的配置规则繁多，路由数据为黑盒，自定义难度大。
2. ElegantRouter 遵循api-first原则，将配置路由的过程自动化。

以配置Vue路由为例，传统的创建页面路由需要以下步骤：

1. 导入布局组件
2. 导入页面组件
3. 在路由配置文件中定义路由

这些步骤虽然不复杂，但在实际开发中，它们是重复且需要手动完成的。此外，路由名称和路径的维护非常麻烦，对布局和页面组件的路由定义没有明确的约定，导致路由定义混乱。
而使用ElegantRouter，你只需要按照约定的规则创建路由文件，即可在指定的路由文件中自动生成路由。

### 特性

- **基于文件系统** - 基于文件系统自动生成路由配置，无需手动定义路由
- **白盒设计** - 路由数据为白盒，自定义难度低
- **类型安全** - 自动生成路由相关的类型定义，提供类型安全的路由导航
- **灵活可配置** - 提供丰富的配置选项，满足不同项目的需求
- **布局管理** - 简化布局与组件的关联配置，自动处理层级关系
- **代码分割** - 自动处理组件导入和代码分割，优化应用性能

### 核心功能

1. **自动路由生成** - 基于文件系统自动生成路由配置
2. **类型定义生成** - 自动生成路由相关的类型定义
3. **路由导入管理** - 自动处理组件导入和代码分割
4. **布局集成** - 简化布局与组件的关联配置
5. **路由转换器** - 提供一级路由到二级路由的转换功能

## 安装

```bash
pnpm install elegant-router
```

## 使用

### 在 Vite 中引入插件

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

### 在 Vue Router 中集成

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

## 路由文件创建规则

新版插件更加灵活，不再对目录结构有严格限制，但仍然建议遵循一定的规范以提高开发效率。

### 基本路由

创建 `src/views/home/index.vue` 将自动生成路由：

```ts
{
  name: 'Home',
  path: '/home',
  layout: 'base',
  component: 'Home'
}
```

> 其中 `layout` 字段指定使用的布局组件，`component` 字段指定视图组件的导入键。通过 transformer 转换后将生成包含 layout 和 children 的二级路由结构。

> 其他的路由属性如 props, meta, beforeEnter 等可以直接在现有路由数据上添加。

### 带参数的路由

创建 `src/views/list/[id].vue` 将自动生成带参数的路由：

```ts
{
  name: 'ListId',
  path: '/list/:id',
  layout: 'base',
  component: 'ListId'
}
```

### 可选参数路由

创建 `src/views/list/detail2-[[id]]-[[userId]].vue` 将自动生成带可选参数的路由：

```ts
{
  name: 'ListDetail2IdUserId',
  path: '/list/detail2-:id?-:userId?',
  layout: 'base',
  component: 'ListDetail2IdUserId'
}
```

### 多参数路由

创建 `src/views/list/detail_[id]_[userId].vue` 将自动生成带多参数的路由：

```ts
{
  name: 'ListDetailIdUserId',
  path: '/list/detail/:id/:userId',
  layout: 'base',
  component: 'ListDetailIdUserId'
}
```

### Group 路由

创建 `src/views/(group)/demo/index.vue` 将自动生成 Group 路由：

```ts
{
  name: 'Demo',
  path: '/demo',
  component: 'Demo'
}
```

### 自定义路由

自定义路由用于使用已有的页面路由文件

#### 自定义路由配置

```ts
ElegantRouter({
  customRoutes: {
    'CustomRoute': '/custom-route'
  },
});
```

#### 自定义路由的component

```ts
{
  name: "CustomRoute",
  path: "/custom-route",
  layout: "base",
  component: "wip", // 使用已有的页面路由文件
}
```

## 自动生成的文件

启动项目后，插件会在配置的 `routerGeneratedDir` 目录下（默认为 `src/router/_generated`）生成以下文件：

1. **routes.ts** - 包含基于文件系统生成的路由配置
2. **imports.ts** - 包含自动导入的布局和视图组件
3. **transformer.ts** - 提供路由转换功能，将一级路由转换为 Vue Router 所需的格式
4. **shared.ts** - 提供路由路径和名称映射，方便在代码中使用

## 路由转换过程

插件通过 transformer 将一级路由转换为 Vue Router 可用的格式：

```ts
// 转换前的一级路由
{
  name: 'Home',
  path: '/home',
  layout: 'base',
  component: 'Home'
}

// 转换后的Vue路由
// 以布局为单位进行分组
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

      // 项目别名配置
      alias: {
        '@': 'src'
      },

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

## 新旧版本的主要差异

### 1. 设计理念的变化

#### 旧版插件
- **强耦合的路由与菜单数据**: 为了方便快速根据路由数据直接生成菜单数据，对目录结构有很严格的限制。
- **特定的目录结构要求**: 要求遵循严格的目录结构规范，如不允许在有子目录的同时拥有同级的 index.vue 文件。
- **多级路由生成**: 支持生成多层嵌套的路由结构，最终转换为 Vue Router 的两层结构。

#### 新版插件
- **解耦路由与菜单**: 新版专注于路由生成，不再考虑菜单数据的自动生成，由用户自行处理菜单数据。
- **更灵活的目录结构**: 不再对目录结构有严格限制，更专注于文件命名约定。
- **一级路由模型**: 生成的路由数据为一级结构，包含 layout 和 component 信息，通过 transformer 按布局分组转换成二级路由。

### 2. 技术实现的变化

#### 旧版插件
- **组件组合方式**: 使用 `layout.base$view.about` 格式字符串表示布局和组件的组合关系。
- **递归的路由结构**: 生成递归嵌套的路由结构，再在转换时拍平为二级。
- **生成的文件**: 生成 imports.ts、routes.ts、transform.ts 三个文件。

#### 新版插件
- **分离的布局与组件**: 使用独立的 `layout` 和 `component` 字段表示布局和组件。
- **一级数据模型**: 生成简单一级的路由数据，布局通过 transformer 分组处理。
- **额外的工具文件**: 除了原有三个文件外，新增 shared.ts 文件提供路由路径和名称映射的工具函数。
- **更完善的类型支持**: 自动生成更全面的类型定义，提供类型安全的路由导航。

### 3. 生成的路由数据对比

#### 旧版插件生成的路由示例
```ts
// 单级路由
{
  name: 'about',
  path: '/about',
  component: 'layout.base$view.about',
  meta: {
    title: 'about'
  }
}

// 多级路由
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

#### 新版插件生成的路由示例
```ts
// 所有路由均为一级结构
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

### 4. 转换后的路由结构对比

#### 旧版插件转换后的 Vue 路由
```ts
// 单级路由转换结果
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

// 多级路由转换结果
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

#### 新版插件转换后的 Vue 路由
```ts
// 转换后以布局为单位进行分组
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

### 新版插件的改进点

1. **更简洁的路由模型**: 采用一级路由数据模型，简化了路由生成逻辑，更易于理解和维护。
2. **更灵活的文件结构**: 去除了对目录结构的严格限制，用户可以更自由地组织项目文件。
3. **更强大的类型支持**: 提供了更完善的类型定义和工具函数，增强了路由导航的类型安全性。
4. **按布局分组的转换逻辑**: transformer 按布局对路由进行分组，使得同一布局下的页面更好管理。
5. **路由名称和路径映射工具**: 新增 shared.ts 文件提供路由名称和路径的映射工具，方便代码中引用路由。
6. **更合理的文件命名**: 生成的组件导入名称更加直观，与文件路径保持一致性。
7. **更高的可扩展性**: 分离布局和组件配置，为未来提供更多自定义可能性。

### 使用建议

1. 如果你的项目正在使用旧版插件，并且已经基于其严格的目录结构组织了大量页面，建议继续使用旧版插件，或者在迁移时做好充分准备。
2. 对于新项目，建议直接使用新版插件，享受更灵活的文件结构和更强大的类型支持。
3. 如果你的项目有复杂的菜单需求，需要自行开发菜单生成逻辑，不再依赖于路由自动生成菜单数据。

## 最佳实践

1. 保持合理的文件命名和目录结构，虽然不再严格限制，但良好的组织结构有助于代码维护
2. 使用参数路由时，根据需要选择必选参数 `[param]` 或可选参数 `[[param]]`
3. 合理配置布局组件，利用 layout 参数控制页面的布局
4. 利用 shared.ts 中提供的工具函数进行类型安全的路由导航
5. 适当使用懒加载提高应用性能