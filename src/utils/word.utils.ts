import { InvalidRow } from '../types/InvalidRow';
import { isNil } from './type.utils';

/**
 * Validates that each row is on the format "word,hint:word,hint".
 *
 * @return true if valid, false otherwise.
 */
const validateRow = (row: string): boolean => {
  const [sourcePart, targetPart] = row.split(':');

  if (!sourcePart || !targetPart) {
    return false;
  }

  const [sourceWord, sourceHint] = sourcePart.split(',');
  const [targetWord] = targetPart.split(',');

  if (
    isNil(sourceWord) ||
    isNil(sourceHint) ||
    isNil(targetWord)
  ) {
    return false;
  }

  return true;
};

export const getInvalidRows = (rows: Array<string>): Array<InvalidRow> => {
  const invalidRows = rows
    .map((row, index) => ({ row, index: index + 1 }))
    .filter(({ row }) => row.trim() !== '' && !validateRow(row));

  return invalidRows;
};
