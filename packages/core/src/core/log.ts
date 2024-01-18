import { consola } from 'consola';
import type { LogType } from 'consola';
import { lightGreen } from 'kolorist';

/**
 * log the message
 *
 * @param msg the message
 * @param type the log type
 * @param show whether to show the log
 */
export function log(msg: string, type: LogType, show = true) {
  if (!show) return;

  consola[type](`${lightGreen('[elegant-router]')} ${msg}`);
}
