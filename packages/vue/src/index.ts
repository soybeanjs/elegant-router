import type {
  ElegantRouterFile,
  ElegantRouterNamePathEntry,
  ElegantRouterNamePathMap,
  ElegantRouterOption,
  ElegantRouterTree
} from '@elegant-router/core';
import unplugin from './unplugin';
import type { ElegantConstRoute, ElegantVueRouterOption } from './types';

export type {
  ElegantRouterOption,
  ElegantRouterFile,
  ElegantRouterNamePathMap,
  ElegantRouterNamePathEntry,
  ElegantRouterTree,
  ElegantVueRouterOption,
  ElegantConstRoute
};
export default unplugin;
