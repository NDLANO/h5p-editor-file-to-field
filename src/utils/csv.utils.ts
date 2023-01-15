import type { Delimiter } from "../types/delimiter";
import { isNotNil } from "./type.utils";

export const parseCSV = (
  csv: string,
  wordHintSeparator: string,
  languageSeparator: string,
): Array<string> => {
  const rowsWithErrors: Array<string> = [];

  let rows = csv.split("\n");
  const delimiter = findDelimiter(rows);

  rows = removeHeaderRow(rows, delimiter);
  rows = removeHeaderColumn(rows, delimiter);

  const parsedRows = rows
    .filter(row => row.trim() !== "")
    .map((row, index) => {
      try {
        const [sourceWord, sourceHint, targetWord, targetHint] =
          row.split(delimiter);

        return (
          sourceWord +
          wordHintSeparator +
          sourceHint +
          languageSeparator +
          targetWord +
          wordHintSeparator +
          targetHint
        );
      } catch {
        // If we could not extract all four items from the row, it might be misshapen.

        rowsWithErrors.push(`${index + 1}: ${row}`);
      }

      return undefined;
    })
    .filter(isNotNil);

  const hasErrors = rowsWithErrors.length > 0;
  if (hasErrors) {
    alert(`The following rows had errors:

      ${rowsWithErrors.join("\n")}`);
  }

  return parsedRows;
};

export const findDelimiter = (csvRows: Array<string>): Delimiter => {
  // When parsing the CSV files, we assume that the delimiter is either `,` or `;`.
  // To check which one, we check each row to verify that the delimiter exists there.
  // If we can't find a definite delimiter, we'll chose comma (`,`) as the default.

  for (const row of csvRows) {
    const hasComma = row.includes(",");
    const hasSemicolon = row.includes(";");

    if (!hasComma) {
      return ";";
    }

    if (!hasSemicolon) {
      return ",";
    }
  }

  return ",";
};

export const removeHeaderRow = (
  csvRows: Array<string>,
  delimiter: Delimiter,
): Array<string> => {
  // In some cases, when exporting to CSV, the first row is an empty header row.
  // On such case is when exporting the default template from Numbers.app on Mac.
  // If the first row includes nothing but delimiters, we know that we can remove it.

  const regex = new RegExp(delimiter, "g");

  return csvRows.filter((row, index) =>
    index === 0 ? row.replace(regex, "") !== "" : true,
  );
};

export const removeHeaderColumn = (
  csvRows: Array<string>,
  delimiter: Delimiter,
): Array<string> => {
  // If each row starts with a delimiter, the CSV has a header column.
  // We don't want that, and will remove it.

  const eachRowStartsWithDelimiter = csvRows
    .filter(row => row.trim() !== "")
    .every(row => row.trim().startsWith(delimiter));

  if (eachRowStartsWithDelimiter) {
    return csvRows.map(row => row.trim().slice(1));
  }

  return csvRows;
};
