import { Option } from "./option";

export const removeKey = <Key extends keyof Record, Record>(
	key: Key,
	record: Record,
): Omit<Record, Key> => {
	const { [key]: _value, ...rest } = record;

	return rest;
};

export const get = <Key extends keyof Record, Record>(
	key: Key,
	record: Record,
): Option<Record[Key]> => {
	return Option.fromNullable(record[key]);
};
