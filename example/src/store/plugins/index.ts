import type { PiniaPluginContext } from 'pinia';
import { klona } from 'klona/json';
import { storeIdRecord } from '../id';

/**
 * The plugin reset the state of the store which is written by setup syntax
 *
 * @param context
 */
export function resetSetupStore(context: PiniaPluginContext) {
  const setupSyntaxIds = Object.values(storeIdRecord);

  if (setupSyntaxIds.includes(context.store.$id)) {
    const { $state } = context.store;

    const defaultStore = klona($state);

    context.store.$reset = () => {
      context.store.$patch(defaultStore);
    };
  }
}
