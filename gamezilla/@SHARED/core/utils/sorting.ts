export function descend<T>(keyFn: (value: T) => string) {
  return (a: T, b: T): number => {
    const aValue = keyFn(a);
    const bValue = keyFn(b);

    if (aValue > bValue) {
      return -1;
    } else if (aValue < bValue) {
      return 1;
    } else {
      return 0;
    }
  };
}

export function ascend<T>(keyFn: (value: T) => number) {
  return (a: T, b: T): number => {
    const aValue = keyFn(a);
    const bValue = keyFn(b);

    if (aValue < bValue) {
      return -1;
    } else if (aValue > bValue) {
      return 1;
    } else {
      return 0;
    }
  };
}
