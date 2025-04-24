import { consola } from 'consola';
import type { ConsolaInstance, LogType } from 'consola';
import { lightGreen } from 'kolorist';

class Logger {
  private readonly logger: ConsolaInstance;

  prefix: string;

  constructor(prefix = lightGreen('[elegant-router]')) {
    this.logger = consola;
    this.prefix = prefix;
  }

  log(msg: string, type: LogType, show = true) {
    if (!show) return;

    this.logger[type](`${this.prefix} ${msg}`);
  }

  info(msg: string, show = true) {
    this.log(msg, 'info', show);
  }

  warn(msg: string, show = true) {
    this.log(msg, 'warn', show);
  }

  error(msg: string, show = true) {
    this.log(msg, 'error', show);
  }

  // eslint-disable-next-line class-methods-use-this
  table(data: any[], show = true) {
    if (!show) return;

    // eslint-disable-next-line no-console
    console.table(data);
  }
}

export const logger = new Logger();
