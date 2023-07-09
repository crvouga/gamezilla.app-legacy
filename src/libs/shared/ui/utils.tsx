import { ReactNode } from "react";

export type VDom = ReactNode;

export const cn = (
  ...classes: (string | boolean | number | undefined | null)[]
) => {
  return classes.filter(Boolean).join(" ");
};
