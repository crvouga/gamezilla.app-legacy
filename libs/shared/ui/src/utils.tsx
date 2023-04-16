export const classNames = (
  ...classes: (string | boolean | number | undefined | null)[]
) => {
  return classes.filter(Boolean).join(' ');
};
