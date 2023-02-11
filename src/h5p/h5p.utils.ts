import type { TranslationHasParams, TranslationParams } from 'h5p-types';
import { H5PEditor } from 'h5p-utils';
import { libraryStrings } from '../../language/en.json';
import library from '../../library.json';

type Translations = typeof libraryStrings;

type TranslationKey = keyof Translations;
type Translation<T extends TranslationKey> = Translations[T];

export const t: <T extends TranslationKey>(
  key: T,
  vars?: TranslationHasParams<Translation<T>> extends true
    ? TranslationParams<Translation<T>>
    : undefined,
) => string = H5PEditor.t.bind(
  null,
  library.machineName as `H5PEditor.${string}`,
);
