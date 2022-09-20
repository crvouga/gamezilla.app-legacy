export * as ReduxDevTools from "./ReduxDevTools"

export const formatMsg = (msg: unknown): string => {
  try {
    return JSON.stringify(msg)
      .replaceAll('"', "")
      .replaceAll("[", "")
      .replaceAll("]", "")
      .split(",")
      .join(".")
  } catch (_error) {
    return ""
  }
}


export const format = (msg: Array<unknown>) => {
  return msg
    .flat(Infinity)
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

