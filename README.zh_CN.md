# ElegantRouter 优雅路由

中文 | [English](./README.md)

## 介绍

ElegantRouter 是一个基于文件系统创建路由的工具，它能自动化生成路由定义、路由文件导入以及路由相关的类型定义。只需按照约定的规则创建路由文件，无需在路由文件中添加任何额外配置。

### 异同点

ElegantRouter 与其他基于文件系统的路由工具的主要区别在于：

1. 其他工具的配置规则繁多，路由数据为黑盒，自定义难度大。
2. ElegantRouter 遵循api-first原则，将配置路由的过程自动化。

以配置Vue路由为例，传统的创建页面路由需要以下步骤：

1. 导入布局组件
2. 导入页面组件
3. 在路由配置文件中定义路由

这些步骤虽然不复杂，但在实际开发中，它们是重复且需要手动完成的。此外，路由名称和路径的维护非常麻烦，对布局和页面组件的路由定义没有明确的约定，导致路由定义混乱。
而使用ElegantRouter，你只需要按照约定的规则创建路由文件，即可在指定的路由文件中自动生成路由。

### ElegantRouter 的路由配置过程

只需要按照约定的规则创建路由文件即可在指定的路由文件中生成该路由

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
import { generatedRoutes } from "../elegant/routes";
import { layouts, views } from "../elegant/imports";
import { transformElegantRoutesToVueRoutes } from "../elegant/transform";

const customRoutes: CustomRoute[] = [
  {
    name: "root",
    path: "/",
    redirect: {
      name: "403",
    },
  },
  {
    name: "not-found",
    path: "/:pathMatch(.*)*",
    component: "layout.base$view.404",
  },
];

const elegantRoutes: ElegantRoute[] = [...customRoutes, ...generatedRoutes];

export const routes = transformElegantRoutesToVueRoutes(
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
  name: 'about',
  path: '/about',
  component: 'layout.base$view.about',
  meta: {
    title: 'about'
  }
},
```

> 它是一个单级路由，为了添加布局，组件属性将布局和视图组件组合在一起，用美元符号“$”分割

#### 转换成的Vue路由

```ts
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
},
```

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

**错误示例**

```
views
├── list
│   ├── index.vue
│   ├── detail
│   │   └── index.vue
```
> 请不要出现上述 index.vue 和文件夹同级的情况，这种情况不在约定的规则中

#### 生成的路由

```ts
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
    },
    {
      name: 'list_detail',
      path: '/list/detail',
      component: 'view.list_detail',
      meta: {
        title: 'list_detail'
      }
    }
  ]
}
```

> 二级路由的路由数据也是有两层的，第一层路由是布局组件，第二层路由是页面组件

#### 转换成的Vue路由

```ts
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
    },
    {
      name: 'list_detail',
      path: '/list/detail',
      component: () => import('@/views/list/detail/index.vue'),
      meta: {
        title: 'list_detail'
      }
    }
  ]
},
```

> 路由数据的第一层包含重定向的配置，默认重定向到第一个子路由

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

> 通过下划线符号 `_` 来分割路由层级，这样可以避免文件夹层级过深

#### 生成的路由

```ts
{
  name: 'multi-menu',
  path: '/multi-menu',
  component: 'layout.base',
  meta: {
    title: 'multi-menu'
  },
  children: [
    {
      name: 'multi-menu_first',
      path: '/multi-menu/first',
      meta: {
        title: 'multi-menu_first'
      },
      children: [
        {
          name: 'multi-menu_first_child',
          path: '/multi-menu/first/child',
          component: 'view.multi-menu_first_child',
          meta: {
            title: 'multi-menu_first_child'
          }
        }
      ]
    },
    {
      name: 'multi-menu_second',
      path: '/multi-menu/second',
      meta: {
        title: 'multi-menu_second'
      },
      children: [
        {
          name: 'multi-menu_second_child',
          path: '/multi-menu/second/child',
          meta: {
            title: 'multi-menu_second_child'
          },
          children: [
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
      ]
    }
  ]
}
```

> 如果路由层级大于 2，生成的路由数据是一个递归结构

#### 转换成的Vue路由

```ts
{
  name: 'multi-menu',
  path: '/multi-menu',
  component: BaseLayout,
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
      component: () => import('@/views/multi-menu/first_child/index.vue'),
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
      },
    },
    {
      name: 'multi-menu_second_child',
      path: '/multi-menu/second/child',
      redirect: {
        name: 'multi-menu_second_child_home'
      },
      meta: {
        title: 'multi-menu_second_child'
      },
    },
    {
      name: 'multi-menu_second_child_home',
      path: '/multi-menu/second/child/home',
      component: () => import('@/views/multi-menu/second_child_home/index.vue'),
      meta: {
        title: 'multi-menu_second_child_home'
      }
    }
  ]
},
```

> 转换的 Vue 路由只有两层，第一层是布局组件，第二层是重定向路由或者页面路由

### 忽略文件夹的聚合路由

以下划线 `_` 开头的文件夹名称会被忽略，不会出现在路由中，其下的文件会被聚合到上一级的路由中

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
  name: '403',
  path: '/403',
  component: 'layout.base$view.403',
  meta: {
    title: '403'
  }
},
{
  name: '404',
  path: '/404',
  component: 'layout.base$view.404',
  meta: {
    title: '404'
  }
},
{
  name: '500',
  path: '/500',
  component: 'layout.base$view.500',
  meta: {
    title: '500'
  }
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
  name: 'user',
  path: '/user/:id',
  component: 'layout.base$view.user',
  props: true,
  meta: {
    title: 'user'
  }
}
```

#### 高级的参数路由

```ts
import type { RouteKey } from "@elegant-router/types";

ElegantVueRouter({
  routePathTransformer(routeName, routePath) {
    const routeKey = routeName as RouteKey;

    if (routeKey === "user") {
      return "/user/:id(\\d+)";
    }

    return routePath;
  },
});
```

### 自定义路由

自定义路由只用于生成路由声明，不会生成路由文件，需要手动创建路由文件

#### 自定义路由配置

```ts
ElegantVueRouter({
  customRoutes: {
    map: {
      root: "/",
      notFound: "/:pathMatch(.*)*",
    },
    names: ["two-level_route"],
  },
});
```

**生成的路由key**

```ts
type RouteMap = {
  root: "/";
  notFound: "/:pathMatch(.*)*";
  "two-level": "/two-level";
  "two-level_route": "/two-level/route";
};

type CustomRouteKey = "root" | "notFound" | "two-level" | "two-level_route";
```

#### 自定义路由的component

**复用已经存在的页面路由component**

```ts
import type { CustomRoute } from "@elegant-router/types";

const customRoutes: CustomRoute[] = [
  {
    name: "root",
    path: "/",
    redirect: {
      name: "403",
    },
  },
  {
    name: "not-found",
    path: "/:pathMatch(.*)*",
    component: "layout.base$view.404",
  },
  {
    name: "two-level",
    path: "/two-level",
    component: "layout.base",
    children: [
      {
        name: "two-level_route",
        path: "/two-level/route",
        component: "view.about",
      },
    ],
  },
];
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

| 属性名           | 说明                                                                           | 类型                                               | 默认值                                                                                       |
| ---------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| dtsDir           | 生成的路由类型声明文件的相对根目录路径                                         | `string`                                           | `"src/typings/elegant-router.d.ts"`                                                          |
| importsDir       | 生成的路由导入文件的相对根目录路径                                             | `string`                                           | `"src/router/elegant/imports.ts"`                                                            |
| lazyImport       | 是否使用懒加载导入                                                             | `(routeName: string) => boolean`                   | `_name => true`                                                                              |
| constDir         | 生成的路由定义文件的相对根目录路径                                             | `string`                                           | `"src/router/elegant/routes.ts"`                                                             |
| customRoutes     | 自定义路由的名称和路径映射表（只会生成路由类型）                               | `{ map: Record<string, string>; names: string[] }` | `{ map: { root: "/", notFound: "/:pathMatch(\*)\*" }, names: []}`                            |
| layouts          | 布局组件的名称和文件路径映射表                                                 | `Record<string, string>`                           | `{ base: "src/layouts/base-layout/index.vue", blank: "src/layouts/blank-layout/index.vue" }` |
| defaultLayout    | 生成路由定义里面的默认布局组件 ( 默认取`layouts`的第一个布局)                  | `string`                                           | `"base"`                                                                                     |
| layoutLazyImport | 是否使用懒加载导入布局组件                                                     | `(layoutName: string) => boolean`                  | `_name => false`                                                                             |
| transformDir     | 路由转换文件的相对根目录路径 (将生成约定的路由定义转换成 vue-router 的 routes) | `string`                                           | `"src/router/elegant/transform.ts"`                                                          |
| onRouteMetaGen   | 路由元信息生成函数                                                             | `(routeName: string) => Record<string, string>`    | `routeName => ({ title: routeName })`                                                        |

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
