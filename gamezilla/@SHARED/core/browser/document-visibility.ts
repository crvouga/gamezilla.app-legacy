import { Sub } from "../sub";

type VisibilityState = "visible" | "hidden";

const documentVisibilityState = Sub.create<VisibilityState>();

export const onDocumentVisibilityState = <T>(
  fn: (state: VisibilityState) => T
) => {
  return Sub.map(documentVisibilityState, fn);
};

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    documentVisibilityState.publish(document.visibilityState);
  });
}
