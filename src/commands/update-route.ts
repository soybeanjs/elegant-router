import { AutoRouter } from '../core';
import type { CliOptions } from '../types';

export async function updateRoute(options: CliOptions) {
  const autoRouter = new AutoRouter(options);
}
