export type VDom = any | null | undefined;

export type VDomChildren = VDom | VDom[] | string | number | null | undefined;

export const cn = (
  ...classes: (string | boolean | number | undefined | null)[]
) => {
  return classes.filter(Boolean).join(" ");
};
