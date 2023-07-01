import path from 'path';
import type { ElegentRouterOption, ElegentRouterItem } from '../types';
import { getFullpathOfPageGlob } from './path';
import { PATH_SPLITTER, PAGE_DEGREE_SPLITTER, PAGE_FILE_NAME_WITH_SQUARE_BRACKETS_PATTERN } from '../constants';

export function transformPageGlobToElegentRouterItem(glob: string, options: ElegentRouterOption) {
  const { cwd, pageDir, pageDirAlias, routeNameTansformer } = options;

  // 1. get path info
  const fullpath = getFullpathOfPageGlob(glob, pageDir, cwd);
  const importPath = path.join(pageDirAlias, glob);

  // 2. get route info
  const dirAndFile = glob.split(PATH_SPLITTER).reverse();
  const [file, ...dirs] = dirAndFile;

  const filteredDirs = dirs.filter(dir => !dir.startsWith(PAGE_DEGREE_SPLITTER)).reverse();

  const routeName = routeNameTansformer(filteredDirs.join(PAGE_DEGREE_SPLITTER).toLocaleLowerCase());
  let routePath = PATH_SPLITTER + routeName.replaceAll(PAGE_DEGREE_SPLITTER, PATH_SPLITTER);

  let routeParamKey = '';

  if (PAGE_FILE_NAME_WITH_SQUARE_BRACKETS_PATTERN.test(file)) {
    const [fileName] = file.split('.');
    routeParamKey = fileName.replace(/\[|\]/g, '');
    routePath = `${routePath}/:${routeParamKey}`;
  }

  const item: ElegentRouterItem = {
    glob,
    fullpath,
    importPath,
    routeName,
    routePath,
    routeParamKey
  };

  return item;
}
