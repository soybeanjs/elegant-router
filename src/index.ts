// import chokidar from 'chokidar';
// import { consola } from 'consola';
// import path from 'path';
import ElegentRouter from './core';

// function setupWatcher() {
//   const cwd = process.cwd();

//   const pageDir = path.join(cwd, 'test');

//   const globs = getPageGlobs(['**/index.{vue,tsx,jsx}', '**/[[]*[]].{vue,tsx,jsx}', '!**/components/**'], pageDir);

//   console.log('globs: ', globs);

// const watcher = chokidar.watch('*', {
//   ignoreInitial: true
// });

//   watcher.on('ready', () => {
//     consola.info('Watcher ready');
//   });

//   watcher.on('add', filepath => {
//     consola.info(`File ${filepath} has been added`);
//   });

//   watcher.on('unlink', filepath => {
//     consola.info(`File ${filepath} has been removed`);
//   });

//   watcher.on('unlinkDir', filepath => {
//     consola.info(`Directory ${filepath} has been removed`);
//   });
// }

// setupWatcher();

function start() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ctx = new ElegentRouter();
}

start();
