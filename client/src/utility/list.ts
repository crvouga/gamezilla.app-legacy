export const reverse = <T>(xs: T[]): T[] => {
  if (xs.length === 0) {
    return [];
  }

  const [first, ...rest] = xs;

  return [...reverse(rest), first];
};

export const dropWhile = <T>(predicate: (x: T) => boolean, xs: T[]): T[] => {
  if (xs.length === 0) {
    return [];
  }

  const [first, ...rest] = xs;

  if (predicate(first)) {
    return rest;
  }

  return [first, ...rest];
};

export const dropLastWhile = <T>(
  predicate: (x: T) => boolean,
  xs: T[]
): T[] => {
  return reverse(dropWhile(predicate, reverse(xs)));
};

export const range = (start: number, stop: number): number[] => {
  if (start >= stop) {
    return [];
  }

  return [start, ...range(start + 1, stop)];
};

export const cartesianProduct = <TX, TY>(xs: TX[], ys: TY[]): [TX, TY][] => {
  const product: [TX, TY][] = [];

  for (const x of xs) {
    for (const y of ys) {
      product.push([x, y]);
    }
  }

  return product;
};

export const map = <TX, TY>(f: (x: TX) => TY, xs: TX[]): TY[] => {
  return xs.map(f);
};

export const concat = <TX, TY>(xs: TX[], ys: TY[]): (TX | TY)[] => {
  return [...xs, ...ys];
};
