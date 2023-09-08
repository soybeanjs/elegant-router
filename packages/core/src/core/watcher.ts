import { watch } from 'chokidar';
import { log } from './log';

export function setupWatcher(
  watchDir: string,
  ignored: string[],
  callback: (glob: string[]) => Promise<void> | void,
  showLog = true
) {
  const watcher = watch('.', {
    ignoreInitial: true,
    cwd: watchDir,
    ignored
  });

  const stacks: string[] = [];
  function addStack(path: string) {
    stacks.push(path);
  }
  function clearStack() {
    stacks.length = 0;
  }
  function replacePath(path: string) {
    return path.replace(/\\/g, '/');
  }

  let timeoutId: NodeJS.Timeout | null = null;

  function handleStack(duration = 500) {
    if (timeoutId) return;

    timeoutId = setTimeout(async () => {
      await callback(stacks);

      clearStack();
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }, duration);
  }

  watcher.on('ready', () => {
    log('watcher ready', 'start', showLog);
  });
  watcher.on('add', path => {
    const replacedPath = replacePath(path);
    addStack(replacedPath);
    handleStack();
  });
  watcher.on('unlink', path => {
    const replacedPath = replacePath(path);
    addStack(replacedPath);
    handleStack();
  });

  return watcher;
}
