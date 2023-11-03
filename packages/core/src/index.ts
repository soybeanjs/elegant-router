import ElegantRouter from './core';
import { splitRouterName, transformRouterNameToPath } from './core/transform';
import { PAGE_DEGREE_SPLITTER, PATH_SPLITTER } from './constants';
import type {
  ElegantRouterOption,
  ElegantRouterFile,
  ElegantRouterNamePathMap,
  ElegantRouterNamePathEntry,
  ElegantRouterTree
} from './types';

export type {
  ElegantRouterOption,
  ElegantRouterFile,
  ElegantRouterNamePathMap,
  ElegantRouterNamePathEntry,
  ElegantRouterTree
};

export { PAGE_DEGREE_SPLITTER, PATH_SPLITTER, splitRouterName, transformRouterNameToPath };

export default ElegantRouter;
