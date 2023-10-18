# ElegantRouter 优雅路由

中文 | [English](./README.en_US.md)

## 介绍

ElegantRouter 是一个基于文件系统创建路由的工具，能够直接自动生成路由的定义、路由文件的导入以及路由相关的类型定义，只需要按照约定的规则创建路由文件即可，不需要在路由文件中写入任何额外的配置。

### 异同点

ElegantRouter 与其他基于文件系统的路由工具的异同点如下：

1. 其他基于文件系统的路由工具约定配置繁多，路由数据为黑盒，自定义难度大
2. ElegantRouter 仍然遵循的是api-first的原则，只是把配置路由的过程自动化

### 传统的路由配置过程

这里拿配置Vue路由的过程为例，要创建一个页面路由需要经历以下的步骤：

1. 导入布局组件
2. 导入页面组件
3. 在路由配置文件中定义路由

**缺点:**

- 上述的步骤虽然看起来不算复杂，但是在实际的开发过程中，这些步骤都是重复的，而且每次都需要手动完成。
- 路由名称和路径的维护是非常麻烦
- 对布局和页面组件的路由定义没有明确的约定，导致路由定义的混乱

### ElegantRouter 的路由配置过程

只需要按照约定的规则创建路由文件即可在指定的路由文件中生成该该路由

## 安装

### 安装 Vue 版本 (其他框架版本敬请期待...)

```bash
pnpm install @elegant-router/vue
```

## 使用

### 在 Vite 中引入插件

```ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ElegantVueRouter from "@elegant-router/vue/vite";

export default defineConfig({
  plugins: [
    vue(),
    ElegantVueRouter({
      alias: {
        "@": "src",
      },
      layouts: {
        base: "src/layouts/base-layout/index.vue",
        blank: "src/layouts/blank-layout/index.vue",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

### 在 Vue 路由中集成

**src/router/routes/index.ts**

```ts
import type { ElegantRoute, CustomRoute } from "@elegant-router/types";
import { autoRoutes } from "../elegant/routes";
import { layouts, views } from "../elegant/imports";
import { transformElegantRouteToVueRoute } from "../elegant/transform";

const constantRoutes: CustomRoute[] = [
  {
    name: "root",
    path: "/",
    redirect: {
      name: "403",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    component: "layout.base",
    children: [
      {
        name: "not-found",
        path: "",
        component: "view.404",
      },
    ],
  },
];

const elegantRoutes: ElegantRoute[] = [...constantRoutes, ...autoRoutes];

export const routes = transformElegantRouteToVueRoute(
  elegantRoutes,
  layouts,
  views
);
```

**src/router/index.ts**

```ts
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
```

### 启动项目

启动项目后，插件会自动生成 src/router/elegant 目录，该目录下的文件为自动生成的路由导入、路由定义和路由转换的文件

## 配置

### 路由文件创建

通过配置 `pagePatterns` 可以指定路由文件的创建规则，路由文件的创建规则为正则表达式，如果路由文件的路径匹配该正则表达式，则会创建路由文件

默认：文件夹下面所有以 `index.vue`、`[id].vue`、`[module].vue` 等 命名的文件

```ts
pagePatterns: ["**‍/index.vue", "**‍/[[]*[]].vue"];
```

### 一级路由(单级路由)

#### 文件夹结构

```
views
├── about
│   └── index.vue
```

#### 生成的路由

```ts
{
  path: '/about',
  component: 'layout.base',
  children: [
    {
      name: 'about',
      path: '',
      component: 'view.about',
      meta: {
        title: 'about'
      }
    }
  ]
}
```

> 虽然是一级路由，但是路由数据仍然是有两层的，因为一级路由也需要使用布局组件，因此第一层路由是布局组件，第二层路由是页面组件

### 二级路由

#### 文件夹结构

```
views
├── list
│   ├── home
│   │   └── index.vue
│   ├── detail
│   │   └── index.vue
```

> 请不要出现以上 index.vue 和文件夹同级的情况，这种情况不在约定的规则中

**错误示例**

```
views
├── list
│   ├── index.vue
│   ├── detail
│   │   └── index.vue
```

#### 生成的路由

```ts
{
  name: 'list',
  path: '/list',
  component: 'layout.base',
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
      component: 'view.list_home',
      meta: {
        title: 'list_home'
      }
    },
    {
      name: 'list_detail',
      path: '/list/detail',
      component: 'view.list_detail',
      meta: {
        title: 'list_detail'
      }
    },
  ]
}
```

> 二级路由的路由数据也是有两层的，第一层路由是布局组件，第二层路由是页面组件，其中第一层的路由数据中包含了重定向的配置，默认重定向到第一个子路由

### 多级路由（三级路由及以上）

#### 文件夹结构

- 文件夹层级深

```
views
├── multi-menu
│   ├── first
│   │   ├── child
│   │   │   └── index.vue
│   ├── second
│   │   ├── child
│   │   │   ├── home
│   │   │   │   └── index.vue
```

- 两层文件夹层级（推荐）

```
views
├── multi-menu
│   ├── first_child
│   │   └── index.vue
│   ├── second_child_home
│   │   └── index.vue
```

> 通过下划线符号 "\_" 来分割路由层级，这样可以避免文件夹层级过深

#### 生成的路由

```ts
{
  name: 'multi-menu',
  path: '/multi-menu',
  component: 'layout.base',
  redirect: {
    name: 'multi-menu_first'
  },
  meta: {
    title: 'multi-menu'
  },
  children: [
    {
      name: 'multi-menu_first',
      path: '/multi-menu/first',
      redirect: {
        name: 'multi-menu_first_child'
      },
      meta: {
        title: 'multi-menu_first'
      }
    },
    {
      name: 'multi-menu_first_child',
      path: '/multi-menu/first/child',
      component: 'view.multi-menu_first_child',
      meta: {
        title: 'multi-menu_first_child'
      }
    },
    {
      name: 'multi-menu_second',
      path: '/multi-menu/second',
      redirect: {
        name: 'multi-menu_second_child'
      },
      meta: {
        title: 'multi-menu_second'
      }
    },
    {
      name: 'multi-menu_second_child',
      path: '/multi-menu/second/child',
      redirect: {
        name: 'multi-menu_second_child_home'
      },
      meta: {
        title: 'multi-menu_second_child'
      }
    },
    {
      name: 'multi-menu_second_child_home',
      path: '/multi-menu/second/child/home',
      component: 'view.multi-menu_second_child_home',
      meta: {
        title: 'multi-menu_second_child_home'
      }
    }
  ]
}
```

> 多级路由的路由数据仍然只有两层，第一层为布局组件，第二层为中间路由层或最后一级路由的组件，其中中间路由层的路由数据中包含了重定向的配置，默认重定向到第一个子路由

### 忽略文件夹的聚合路由

以下划线 "\_" 开头的文件夹名称会被忽略

#### 文件夹结构

```
views
├── _error
│   ├── 403
│   │   └── index.vue
│   ├── 404
│   │   └── index.vue
│   ├── 500
│   │   └── index.vue
```

#### 生成的路由

```ts
{
  path: '/403',
  component: 'layout.base',
  children: [
    {
      name: '403',
      path: '',
      component: 'view.403',
      meta: {
        title: '403'
      }
    }
  ]
},
{
  path: '/404',
  component: 'layout.base',
  children: [
    {
      name: '404',
      path: '',
      component: 'view.404',
      meta: {
        title: '404'
      }
    }
  ]
},
{
  path: '/500',
  component: 'layout.base',
  children: [
    {
      name: '500',
      path: '',
      component: 'view.500',
      meta: {
        title: '500'
      }
    }
  ]
},
```

### 参数路由

#### 文件夹结构

```
views
├── user
│   └── [id].vue
```

#### 生成的路由

```ts
{
  path: '/user/:id',
  component: 'layout.base',
  children: [
    {
      name: 'user',
      path: '',
      component: 'view.user',
      meta: {
        title: 'user'
      }
    }
  ]
}
```

## 插件配置

`ElegantRouterOption`:

| 属性名               | 说明                                                                                       | 类型                                                | 默认值                                 |
| -------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------- | -------------------------------------- |
| cmd                  | 项目根目录                                                                                 | `string`                                            | `process.cwd()`                        |
| pageDir              | 页面文件夹相对根目录的路径                                                                 | `string`                                            | `"src/views"`                          |
| alias                | 别名，可用于路由导入文件的路径替换                                                         | `Record<string, string>`                            | `{ "@": "src" }`                       |
| pagePatterns         | 路由页面文件匹配规则 (匹配语法参照 [micromatch](https://github.com/micromatch/micromatch)) | `string[]`                                          | `["**‍/index.vue", "**‍/[[]*[]].vue"]` |
| pageExcludePatterns  | 路由页面文件排除规则 (默认排除文件夹 components 下作为路由页面文件)                        | `string[]`                                          | `["**‍/components/**"]`                |
| routeNameTransformer | 路由名称转换函数 (默认是以下划线连接的文件夹名称)                                          | `(routeName: string) => string`                     | `routeName => routeName`               |
| routePathTransformer | 路由路径转换函数                                                                           | `(transformedName: string, path: string) => string` | `(_transformedName, path) => path`     |

`ElegantVueRouterOption`:

> 继承自 `ElegantRouterOption`

| 属性名           | 说明                                                                           | 类型                                            | 默认值                                                                                       |
| ---------------- | ------------------------------------------------------------------------------ | ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| dtsDir           | 生成的路由类型声明文件的相对根目录路径                                         | `string`                                        | `"src/typings/elegant-router.d.ts"`                                                          |
| importsDir       | 生成的路由导入文件的相对根目录路径                                             | `string`                                        | `"src/router/elegant/imports.ts"`                                                            |
| lazyImport       | 是否使用懒加载导入                                                             | `(routeName: string) => boolean`                | `_name => true`                                                                              |
| constDir         | 生成的路由定义文件的相对根目录路径                                             | `string`                                        | `"src/router/elegant/routes.ts"`                                                             |
| customRoutesMap  | 自定义路由的名称和路径映射表（只会生成路由类型）                               | `Record<string, string>`                        | `{ root: "/", notFound: "/:pathMatch(\*)\*" }`                                               |
| layouts          | 布局组件的名称和文件路径映射表                                                 | `Record<string, string>`                        | `{ base: "src/layouts/base-layout/index.vue", blank: "src/layouts/blank-layout/index.vue" }` |
| defaultLayout    | 生成路由定义里面的默认布局组件 ( 默认取`layouts`的第一个布局)                  | `string`                                        | `"base"`                                                                                     |
| layoutLazyImport | 是否使用懒加载导入布局组件                                                     | `(layoutName: string) => boolean`               | `_name => false`                                                                             |
| transformDir     | 路由转换文件的相对根目录路径 (将生成约定的路由定义转换成 vue-router 的 routes) | `string`                                        | `"src/router/elegant/transform.ts"`                                                          |
| onRouteMetaGen   | 路由元信息生成函数                                                             | `(routeName: string) => Record<string, string>` | `routeName => ({ title: routeName })`                                                        |

## 注意事项

- 文件夹的命名方式：只能包含 字母、数字、短横线、下划线，不能包含其他特殊字符

  > 下划线是路由层级的切割标识，短横线用于在一级路由中连接多个单词

- 生成的路由数据都为两层的原因是为了契合 vue-router 的页面缓存功能，同时由于 KeepAlive 只和 Vue 文件的名称而不是路由名称有关，因此，插件会自动给 Vue 文件注入 name 属性，该属性的值为路由名称

  ```ts
  defineOptions({
    name: "about",
  });
  ```

  > 目前只支持 script setup 的方式, 注入以上的 `defineOptions` 函数
