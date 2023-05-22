export type Set<T> = {
  [key: string]: T;
};

type ToKey<T> = (element: T) => string;

const singleton = <T>(element: T, toKey?: ToKey<T>): Set<T> => {
  const key = toKey ? toKey(element) : String(element);
  return {
    [key]: element,
  };
};

const fromArray = <T>(array: T[], toKey?: ToKey<T>): Set<T> => {
  const set: Set<T> = {};

  for (const element of array) {
    const key = toKey ? toKey(element) : String(element);

    set[key] = element;
  }

  return set;
};

const toArray = <T>(set: Set<T>): T[] => {
  return Object.values(set);
};

const add = <T>(
  element: T,
  set: Set<T>,
  toKey?: (element: T) => string
): Set<T> => {
  const key = toKey ? toKey(element) : String(element);
  return {
    ...set,
    [key]: element,
  };
};

const remove = <T>(
  element: T,
  set: Set<T>,
  toKey?: (element: T) => string
): Set<T> => {
  const key = toKey ? toKey(element) : String(element);
  const { [key]: _removed, ...rest } = set;
  return rest;
};

const union = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  return {
    ...a,
    ...b,
  };
};

const intersect = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const c: Set<T> = {};

  for (const key in a) {
    const element = a[key];

    if (!element) {
      continue;
    }

    if (b[key]) {
      c[key] = element;
    }
  }

  return c;
};

const diff = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const c: Set<T> = { ...a };

  for (const key in a) {
    const element = a[key];

    if (!element) {
      continue;
    }

    if (b[key]) {
      delete c[key];
    }
  }

  return c;
};

const size = <T>(a: Set<T>): number => {
  return Object.keys(a).length;
};

const isEmpty = <T>(a: Set<T>): boolean => {
  return size(a) === 0;
};

const isMember = <T>(element: T, set: Set<T>, toKey?: ToKey<T>): boolean => {
  const key = toKey ? toKey(element) : String(element);
  return Boolean(set[key]);
};

export const Set = {
  singleton,
  fromArray,
  toArray,
  add,
  remove,
  union,
  intersect,
  diff,
  size,
  isEmpty,
  isMember,
};
