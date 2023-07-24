export const map = <T, U>(xs: Iterable<T>, fn: (item: T) => U): Iterable<U> => {
  return {
    *[Symbol.iterator]() {
      for (const item of xs) {
        yield fn(item);
      }
    },
  };
};

export const filter = <T>(
  xs: Iterable<T>,
  fn: (item: T) => boolean
): Iterable<T> => {
  return {
    *[Symbol.iterator]() {
      for (const item of xs) {
        if (fn(item)) {
          yield item;
        }
      }
    },
  };
};

export const reduce = <T, U>(
  xs: Iterable<T>,
  fn: (acc: U, item: T) => U,
  acc: U
): U => {
  for (const item of xs) {
    acc = fn(acc, item);
  }
  return acc;
};
