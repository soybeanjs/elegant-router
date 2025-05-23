/* eslint-disable */
// @ts-nocheck
/* prettier-ignore */
// biome-ignore lint: disable
// Generated by elegant-router
// Read more: https://github.com/soybeanjs/elegant-router

export {}

declare module "vue-router" {
  type RouteNamedMap = import("vue-router/auto-routes").RouteNamedMap;

  export interface TypesConfig {
    RouteNamedMap: RouteNamedMap;
  }
}

declare module "vue-router/auto-routes" {
  import type { RouteParamsRawGeneric, RouteParamsGeneric, RouteMeta, RouteRecordInfo, ParamValue, ParamValueZeroOrOne } from "vue-router";

  /**
   * route named map
  */
  export interface RouteNamedMap {
    "Root": RouteRecordInfo<"Root", "/", Record<never, never>, Record<never, never>>;
    "NotFound": RouteRecordInfo<"NotFound", "/:pathMatch(.*)*", Record<never, never>, Record<never, never>>;
    "403": RouteRecordInfo<"403", "/403", Record<never, never>, Record<never, never>>;
    "404": RouteRecordInfo<"404", "/404", Record<never, never>, Record<never, never>>;
    "Demo": RouteRecordInfo<"Demo", "/demo", Record<never, never>, Record<never, never>>;
    "Home": RouteRecordInfo<"Home", "/home", Record<never, never>, Record<never, never>>;
    "HomeChild": RouteRecordInfo<"HomeChild", "/home/child", Record<never, never>, Record<never, never>>;
    "HomeChild2": RouteRecordInfo<"HomeChild2", "/home/child2", Record<never, never>, Record<never, never>>;
    "List": RouteRecordInfo<"List", "/list", Record<never, never>, Record<never, never>>;
    "ListAdd": RouteRecordInfo<"ListAdd", "/list/add", Record<never, never>, Record<never, never>>;
    "ListDetail2IdUserId": RouteRecordInfo<"ListDetail2IdUserId", "/list/detail2-:id?-:userId?", { id?: ParamValueZeroOrOne<true>, userId?: ParamValueZeroOrOne<true> }, { id?: ParamValueZeroOrOne<false>, userId?: ParamValueZeroOrOne<false> }>;
    "ListDetailIdUserId": RouteRecordInfo<"ListDetailIdUserId", "/list/detail/:id/:userId", { id: ParamValue<true>, userId: ParamValue<true> }, { id: ParamValue<false>, userId: ParamValue<false> }>;
    "ListEditId": RouteRecordInfo<"ListEditId", "/list/edit/:id", { id: ParamValue<true> }, { id: ParamValue<false> }>;
    "ListId": RouteRecordInfo<"ListId", "/list/:id", { id: ParamValue<true> }, { id: ParamValue<false> }>;
    "Login": RouteRecordInfo<"Login", "/login", Record<never, never>, Record<never, never>>;
    "Reuse1": RouteRecordInfo<"Reuse1", "/reuse1", Record<never, never>, Record<never, never>>;
    "Reuse2Id": RouteRecordInfo<"Reuse2Id", "/reuse2/:id", { id: ParamValue<true> }, { id: ParamValue<false> }>;
    "Reuse3Id": RouteRecordInfo<"Reuse3Id", "/reuse3/:id?", { id?: ParamValueZeroOrOne<true> }, { id?: ParamValueZeroOrOne<false> }>;
    "Reuse4IdName": RouteRecordInfo<"Reuse4IdName", "/reuse4/:id?/:name?", { id?: ParamValueZeroOrOne<true>, name?: ParamValueZeroOrOne<true> }, { id?: ParamValueZeroOrOne<false>, name?: ParamValueZeroOrOne<false> }>;
    "Wip": RouteRecordInfo<"Wip", "/wip", Record<never, never>, Record<never, never>>
  }
}
