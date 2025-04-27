import unplugin from './unplugin';
import type { CliOptions } from './types';

export function defineConfig(config?: CliOptions) {
  return config;
}

export * from './core';
export * from './types';
export default unplugin;
