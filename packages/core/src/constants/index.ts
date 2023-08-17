/**
 * the path splitter
 * @example
 * /a/b/c
 */
export const PATH_SPLITTER = '/';

/**
 * the page degree splitter
 * @example
 * a_b_c
 */
export const PAGE_DEGREE_SPLITTER = '_';

export const PAGE_DIR_NAME_PATTERN = /^[\w-]+[0-9a-zA-Z]+$/;

export const PAGE_FILE_NAME_PATTERN = /^[0-9a-zA-Z]+[0-9a-zA-Z-]+[0-9a-zA-Z]+\.[a-z]+$/;

export const PAGE_FILE_NAME_WITH_SQUARE_BRACKETS_PATTERN = /^\[\w+\]\.[a-z]+$/;

export const UPPERCASE_LETTER_PATTERN = /[A-Z]/g;
