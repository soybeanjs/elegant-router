import { consola } from 'consola';
import {
  PAGE_DIR_NAME_PATTERN,
  PAGE_FILE_NAME_PATTERN,
  PAGE_FILE_NAME_WITH_SQUARE_BRACKETS_PATTERN,
  PATH_SPLITTER,
  UPPERCASE_LETTER_PATTERN
} from '../constants';

type ValidateCondition = [boolean, string];

/**
 * validate the glob
 *
 * @param glob the page glob
 * @param globPath the full path of the page glob
 */
export function handleValidatePageGlob(glob: string, globPath: string) {
  const dirAndFile = glob.split(PATH_SPLITTER).reverse();
  const [file, ...dirs] = dirAndFile;

  const validateConditions: ValidateCondition[] = [
    // 1. check whether the glob has the parent directory
    [dirAndFile.length < 2, `The glob "${globPath}" is invalid, it must has the parent directory.`],
    // 2. check whether the directory name is valid
    ...dirs.map(
      dir =>
        [
          !PAGE_DIR_NAME_PATTERN.test(dir),
          `The directory name "${dir}" of the glob "${globPath}" is invalid.`
        ] as ValidateCondition
    ),
    // 3. check whether the file name is valid
    [
      !PAGE_FILE_NAME_PATTERN.test(file) && !PAGE_FILE_NAME_WITH_SQUARE_BRACKETS_PATTERN.test(file),
      `The file name "${file}" of the glob "${globPath}" is invalid.`
    ]
  ];

  if (UPPERCASE_LETTER_PATTERN.test(glob)) {
    consola.info(`The glob "${glob}" contains uppercase letters, it recommended to use lowercase letters.`);
  }

  const isValid = validateConditions.every(([condition, error]) => {
    if (condition) {
      consola.warn(error);
    }
    return !condition;
  });

  return isValid;
}
