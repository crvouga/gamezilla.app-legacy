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
