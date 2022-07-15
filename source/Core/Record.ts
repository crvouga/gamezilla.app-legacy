export const dissoc = <Key extends keyof Record, Record>(
  key: Key,
  record: Record,
): Omit<Record, Key> => {
  const { [key]: _value, ...rest } = record;

  return rest;
};
