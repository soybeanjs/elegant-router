export const ELEGANT_ROUTER_TYPES_MODULE_NAME = '@elegant-router/types';

export const VUE_ROUTER_MODULE_NAME = 'vue-router/auto-routes';

export const ROOT_ROUTE_NAME = 'Root';

export const NOT_FOUND_ROUTE_NAME = 'NotFound';

export const NO_FILE_INODE = -99;

export const BUILT_IN_CUSTOM_ROUTE = {
  [ROOT_ROUTE_NAME]: '/',
  [NOT_FOUND_ROUTE_NAME]: '/:pathMatch(.*)*'
} as const;

export const CLI_CONFIG_SOURCE = 'elegant-router.config';
