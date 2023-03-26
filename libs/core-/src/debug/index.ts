export * as ReduxDevTools from "./ReduxDevTools"

export const formatMsg = (msg: unknown): string => {
  try {
    return JSON.stringify(msg)
      .replace('"', "")
      .replace("[", "")
      .replace("]", "")
      .split(",")
      .join(".")
  } catch (_error) {
    return ""
  }
}

export const format = (msg: Array<unknown>) => {
  return flatten(msg)
    .reduce<[string | null, unknown | null]>(
      ([msgType, payload], item) =>
        typeof item === "string"
          ? msgType
            ? [`${msgType}.${item}`, payload]
            : [item, payload]
          : [msgType, item],
      [null, null],
    )
}


const flatten = <T>(xs: T[] | T): T[] => {
  if (!Array.isArray(xs)) {
    return [xs]
  }
  return flatMap(xs, x => {
    if (Array.isArray(x)) {
      return flatten(x)
    }
    return [x]
  })
}

const flatMap = <T>(xs: T[], f: (x: T) => T[]): T[] => {
  return xs.reduce((acc, x) => [...acc, ...f(x)], [] as T[])
}