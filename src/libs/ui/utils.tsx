export type VDom = JSX.Element;

export type VDomChildren = VDom | VDom[] | string | number | null | undefined;

export const cn = (
  ...classes: (string | boolean | number | undefined | null)[]
) => {
  return classes.filter(Boolean).join(" ");
};
