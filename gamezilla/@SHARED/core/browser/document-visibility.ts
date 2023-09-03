import { Sub } from "../sub";

export const onDocumentVisibilityState = Sub.create<"visible" | "hidden">();

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    onDocumentVisibilityState.publish(document.visibilityState);
  });
}
