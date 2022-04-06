export const maxBy = <T>(keyFn: (x: T) => number, x1: T, x2: T): T => {
  if (keyFn(x1) >= keyFn(x2)) {
    return x1;
  }
  return x2;
};

export const minBy = <T>(keyFn: (x: T) => number, x1: T, x2: T): T => {
  if (keyFn(x1) <= keyFn(x2)) {
    return x1;
  }
  return x2;
};
