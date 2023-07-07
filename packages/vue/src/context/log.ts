import { consola } from 'consola';
import type { LogType } from 'consola';
import { lightGreen } from 'kolorist';

export function log(msg: string, type: LogType, show = true) {
  if (!show) return;

  consola[type](`${lightGreen('[elegant-router]')} ${msg}`);
}
