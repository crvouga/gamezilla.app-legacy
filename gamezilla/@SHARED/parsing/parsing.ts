export const str = (value: unknown): value is string => {
  return typeof value === "string";
};

export const nullish = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

export const or =
  <A, B>(isA: (x: unknown) => x is A, isB: (x: unknown) => x is B) =>
  (x: unknown): x is A | B => {
    return isA(x) || isB(x);
  };

export const num = (value: unknown): value is number => {
  return typeof value === "number";
};

export const has = <T extends Record<string, unknown>, K extends keyof T, V>(
  obj: T,
  key: K,
  checkType: (value: unknown) => value is V
): obj is T & Record<K, V> => {
  return checkType(obj[key]);
};

export const obj = (item: unknown): item is Record<string, unknown> => {
  return typeof item === "object" && item !== null && !Array.isArray(item);
};

export const union =
  <T extends readonly string[]>(enumeration: T) =>
  (token: unknown): token is T[number] => {
    return enumeration.includes(token as T[number]);
  };

export const tuple =
  <Left, Right>(
    isLeft: (x: unknown) => x is Left,
    isRight: (x: unknown) => x is Right
  ) =>
  (input: unknown): input is [Left, Right] => {
    return (
      Array.isArray(input) &&
      input.length === 2 &&
      isLeft(input[0]) &&
      isRight(input[1])
    );
  };

export const is =
  <T>(to: (x: unknown) => T | null) =>
  (x: unknown): x is T => {
    return to(x) !== null;
  };

export const to =
  <T>(is: (x: unknown) => x is T) =>
  (x: unknown): T | null => {
    if (is(x)) {
      return x;
    }
    return null;
  };

export const bool = (value: unknown): value is boolean => {
  return typeof value === "boolean";
};
