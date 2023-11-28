export function minBy<T, K>(arr: T[], keyFn: (value: T) => K): T | undefined {
  let min = arr[0];

  if (!min) {
    return undefined;
  }

  let minKey: K = keyFn(min);

  let i;

  for (i = 1; i < arr.length; i++) {
    const value = arr[i];

    if (!value) {
      return;
    }

    const key = keyFn(value);

    if (key < minKey) {
      min = value;
      minKey = key;
    }
  }

  return min;
}
