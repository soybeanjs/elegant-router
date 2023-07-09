import ElegantRouter from '@elegant-router/core';

import { getRouteConstExport } from './src/context/const';
import { createPluginOptions } from './src/context/options';
import treeJson from './tree.json';

function start() {
  const er = new ElegantRouter();

  const options = createPluginOptions(er.options, {});

  const { autoRoutes } = getRouteConstExport(treeJson as any, options);

  console.log('autoRoutes: ', autoRoutes);
}

start();
