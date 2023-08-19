import type {
  ElegantRouterOption,
  ElegantRouterFile,
  ElegantRouterNamePathMap,
  ElegantRouterNamePathEntry,
  ElegantRouterTree
} from '@elegant-router/core';
import unplugin from './unplugin';
import type { ElegantVueRouterOption, AutoRoute } from './types';

export type {
  AutoRoute,
  ElegantVueRouterOption,
  ElegantRouterOption,
  ElegantRouterFile,
  ElegantRouterNamePathMap,
  ElegantRouterNamePathEntry,
  ElegantRouterTree
};
export default unplugin;
