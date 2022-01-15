export const mapValues = <TK extends string | number | symbol, TX, TY>(
  object: Record<TK, TX>,
  f: (x: TX) => TY
): Record<TK, TY> => {
  const entries = Object.entries(object) as [TK, TX][];

  const initial = {} as Record<TK, TY>;

  return entries.reduce<Record<TK, TY>>(
    (object, [key, value]) => ({ ...object, [key]: f(value) }),
    initial
  );
};
