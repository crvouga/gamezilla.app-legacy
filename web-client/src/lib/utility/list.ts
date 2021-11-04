export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T) => {
  return fns.reduce((acc, fn) => fn(acc), value);
};

export const reverse = <T>(xs: T[]): T[] => {
  return xs.reduce((reversed, x) => [x, ...reversed], []);
};

export const dropWhile = <T>(predicate: (x: T) => boolean, xs: T[]): T[] => {
  if (xs.length === 0) {
    return [];
  }

  const [head, ...tail] = xs;

  if (predicate(head)) {
    return dropWhile(predicate, tail);
  }

  return xs;
};

export const dropLastWhile = <T>(
  predicate: (x: T) => boolean,
  xs: T[]
): T[] => {
  return reverse(dropWhile(predicate, reverse(xs)));
};

export const concat = <T>(left: T[], right: T[]) => {
  return [...left, ...right];
};

export const shuffle = <T>(xs: T[]): T[] => {
  return [...xs].sort(() => Math.random() - 0.5);
};
