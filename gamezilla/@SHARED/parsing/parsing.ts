export const str = (value: unknown): value is string => {
  return typeof value === "string"
}

export const literal = <T extends string>(
  value: unknown,
  literal: T,
): value is T => {
  return value === literal
}

export const nullish = (value: unknown): value is null | undefined => {
  return value === null || value === undefined
}

export const orNullish = <T>(
  is: (x: unknown) => x is T,
): ((x: unknown) => x is T | null | undefined) => {
  return (x: unknown): x is T | null | undefined => {
    return is(x) || nullish(x)
  }
}

export const or =
  <A, B>(isA: (x: unknown) => x is A, isB: (x: unknown) => x is B) =>
  (x: unknown): x is A | B => {
    return isA(x) || isB(x)
  }

export const num = (value: unknown): value is number => {
  return typeof value === "number"
}

export const has = <T extends Record<string, unknown>, K extends keyof T, V>(
  obj: T,
  key: K,
  isValue: (value: unknown) => value is V,
): obj is T & Record<K, V> => {
  return isValue(obj[key])
}

export const record = <V>(
  isValue: (value: unknown) => value is V,
): ((value: unknown) => value is Record<string, V>) => {
  return (value: unknown): value is Record<string, V> => {
    if (!obj(value)) {
      return false
    }

    for (const key in value) {
      if (!isValue(value[key])) {
        return false
      }
    }

    return true
  }
}

export const obj = (item: unknown): item is Record<string, unknown> => {
  return typeof item === "object" && item !== null && !Array.isArray(item)
}

export const dict = <K extends string, V>(
  item: unknown,
  isKey: (x: unknown) => x is K,
  isValue: (x: unknown) => x is V,
): item is Record<K, V> => {
  if (!obj(item)) {
    return false
  }

  for (const key in item) {
    if (!isKey(key) || !isValue(item[key])) {
      return false
    }
  }

  return true
}

export const union =
  <T extends readonly string[]>(enumeration: T) =>
  (token: unknown): token is T[number] => {
    return enumeration.includes(token as T[number])
  }

export const unknown = (_value: unknown): _value is unknown => {
  return true
}

export const tuple =
  <Left, Right>(
    isLeft: (x: unknown) => x is Left,
    isRight: (x: unknown) => x is Right,
  ) =>
  (input: unknown): input is [Left, Right] => {
    return (
      Array.isArray(input) &&
      input.length === 2 &&
      isLeft(input[0]) &&
      isRight(input[1])
    )
  }

export const is =
  <T>(to: (x: unknown) => T | null) =>
  (x: unknown): x is T => {
    return to(x) !== null
  }

export const to =
  <T>(is: (x: unknown) => x is T) =>
  (x: unknown): T | null => {
    if (is(x)) {
      return x
    }
    return null
  }

export const bool = (value: unknown): value is boolean => {
  return typeof value === "boolean"
}
