import * as Option from "./Option";

export const remove = <Key extends keyof Record, Record>(
  key: Key,
  record: Record,
): Omit<Record, Key> => {
  const { [key]: _value, ...rest } = record;

  return rest;
};

export const get = <Key extends keyof Record, Record>(
  key: Key,
  record: Record,
): Option.Option<Record[Key]> => {
  return Option.fromNullable(record[key]);
};
