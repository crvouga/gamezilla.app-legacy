// import { ReactNode } from "react";

export type VDom = JSX.Element;

export const cn = (
  ...classes: (string | boolean | number | undefined | null)[]
) => {
  return classes.filter(Boolean).join(" ");
};
