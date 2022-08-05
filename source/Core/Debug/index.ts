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
