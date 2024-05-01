/**
 * @description
 * Removes a key from an object
 * @param key key to remove
 * @param obj some plain object
 * @returns `obj` with out the key `key`
 */
export const dissoc = <T>(obj: T, ...keys: (keyof T)[]): Omit<T, keyof T> => {
	const copied = { ...obj };
	for (const key of keys) {
		delete copied[key];
	}
	return copied;
};
