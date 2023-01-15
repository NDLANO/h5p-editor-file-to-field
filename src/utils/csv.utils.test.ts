import { describe, it, expect } from "vitest";
import type { Delimiter } from "../types/delimiter";
import {
  findDelimiter,
  parseCSV,
  removeHeaderColumn,
  removeHeaderRow,
} from "./csv.utils";

describe("CSV utils", () => {
  describe(findDelimiter.name, () => {
    it("should find the most probable delimiter from a set of CSV rows (comma)", () => {
      const rows = ["ocean/sea,o___n,sjø,s_ø", "fire,f__e,ild,"];

      const expected: Delimiter = ",";
      const actual = findDelimiter(rows);

      expect(actual).toBe(expected);
    });

    it("should find the most probable delimiter from a set of CSV rows (semicolon)", () => {
      const rows = ["ocean/sea;o___n;sjø;s_ø", "fire;f__e;ild;"];

      const expected: Delimiter = ";";
      const actual = findDelimiter(rows);

      expect(actual).toBe(expected);
    });

    it("should return comma if the delimiter is ambigous", () => {
      const rows = ["ocean;sea,o___n,sjø,s_ø", "fire;flame,f__e,ild,"];

      const expected: Delimiter = ",";
      const actual = findDelimiter(rows);

      expect(actual).toBe(expected);
    });
  });

  describe(removeHeaderRow.name, () => {
    it("should remove the header row", () => {
      const rows = [";;;", "ocean/sea;o___n;sjø;s_ø", "fire;f__e;ild;"];
      const delimiter: Delimiter = ";";

      const expected = ["ocean/sea;o___n;sjø;s_ø", "fire;f__e;ild;"];
      const actual = removeHeaderRow(rows, delimiter);

      expect(actual).toStrictEqual(expected);
    });

    it("should not do anything if there's no header row", () => {
      const rows = ["ocean/sea;o___n;sjø;s_ø", "fire;f__e;ild;"];
      const delimiter: Delimiter = ";";

      const expected = ["ocean/sea;o___n;sjø;s_ø", "fire;f__e;ild;"];
      const actual = removeHeaderRow(rows, delimiter);

      expect(actual).toStrictEqual(expected);
    });
  });

  describe(removeHeaderColumn.name, () => {
    it("should remove the header column", () => {
      const rows = [";ocean/sea;o___n;sjø;s_ø", ";fire;f__e;ild;"];
      const delimiter: Delimiter = ";";

      const expected = ["ocean/sea;o___n;sjø;s_ø", "fire;f__e;ild;"];
      const actual = removeHeaderColumn(rows, delimiter);

      expect(actual).toStrictEqual(expected);
    });

    it("should not do anything if there's no header column", () => {
      const rows = ["ocean/sea;o___n;sjø;s_ø", "fire;f__e;ild;"];
      const delimiter: Delimiter = ";";

      const expected = ["ocean/sea;o___n;sjø;s_ø", "fire;f__e;ild;"];
      const actual = removeHeaderColumn(rows, delimiter);

      expect(actual).toStrictEqual(expected);
    });
  });

  describe(parseCSV.name, () => {
    it("should parse a CSV and output the cells separated by the designated separators", () => {
      const wordHintSeparator = ":";
      const languageSeparator = "|";

      const csv = "ocean/sea;o___n;sjø;s_ø";

      const expected = ["ocean/sea:o___n|sjø:s_ø"];
      const actual = parseCSV(csv, wordHintSeparator, languageSeparator);

      expect(actual).toStrictEqual(expected);
    });

    it("should handle header rows", () => {
      const wordHintSeparator = ":";
      const languageSeparator = "|";

      const csv = `;;;
ocean/sea;o___n;sjø;s_ø`;

      const expected = ["ocean/sea:o___n|sjø:s_ø"];
      const actual = parseCSV(csv, wordHintSeparator, languageSeparator);

      expect(actual).toStrictEqual(expected);
    });

    it("should handle header columns", () => {
      const wordHintSeparator = ":";
      const languageSeparator = "|";

      const csv = `;ocean/sea;o___n;sjø;s_ø`;

      const expected = ["ocean/sea:o___n|sjø:s_ø"];
      const actual = parseCSV(csv, wordHintSeparator, languageSeparator);

      expect(actual).toStrictEqual(expected);
    });

    it("should handle rows with missing cells", () => {
      const wordHintSeparator = ":";
      const languageSeparator = "|";

      const csv = `ocean/sea;o___n;sjø;s_ø
fire;f__e;ild✨;`;

      const expected = ["ocean/sea:o___n|sjø:s_ø", "fire:f__e|ild✨:"];
      const actual = parseCSV(csv, wordHintSeparator, languageSeparator);

      expect(actual).toStrictEqual(expected);
    });

    it("should handle comma as separator", () => {
      const wordHintSeparator = ":";
      const languageSeparator = "|";

      const csv = `ocean/sea,o___n,sjø,s_ø
fire,f__e,ild✨,`;

      const expected = ["ocean/sea:o___n|sjø:s_ø", "fire:f__e|ild✨:"];
      const actual = parseCSV(csv, wordHintSeparator, languageSeparator);

      expect(actual).toStrictEqual(expected);
    });

    it("should handle complex examples", () => {
      const wordHintSeparator = ":";
      const languageSeparator = "|";

      const csv = `;;;;;;
;ocean/sea;o___n;sjø;s_ø;;
;fire;f__e;ild✨;;;
`;

      const expected = ["ocean/sea:o___n|sjø:s_ø", "fire:f__e|ild✨:"];
      const actual = parseCSV(csv, wordHintSeparator, languageSeparator);

      expect(actual).toStrictEqual(expected);
    });
  });
});
