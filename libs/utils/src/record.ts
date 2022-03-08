export const mapValues = <TY, TX, TK extends string | number | symbol>(
  object: Record<TK, TX>,
  f: (x: TX, key: TK) => TY,
): Record<TK, TY> => {
  const entries = Object.entries(object) as [TK, TX][];

  const initial = {} as Record<TK, TY>;

  return entries.reduce<Record<TK, TY>>(
    (object, [key, value]) => ({ ...object, [key]: f(value, key) }),
    initial,
  );
};

const mergeLeft = <T>(l: T, r: Partial<T>): T => {
  return {
    ...l,
    ...r,
  };
};

export const Record = {
  mapValues,
  mergeLeft,
};
