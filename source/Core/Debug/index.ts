export * as ReduxDevTools from "./ReduxDevTools";

export const formatMsg = (msg: unknown) =>
  JSON.stringify(msg)
    .replaceAll('"', "")
    .replaceAll("[", "")
    .replaceAll("]", "")
    .split(",")
    .join(", ");
