export const isNil = <T>(
  value: T | null | undefined,
): value is null | undefined => value == null;

export const isNotNil = <T>(value: T | null | undefined): value is T =>
  value != null;
