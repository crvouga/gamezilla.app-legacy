export const removeKey = <T>(key: keyof T, object: T) => {
  const { [key]: _value, ...removedKey } = object;
  return removedKey;
};
