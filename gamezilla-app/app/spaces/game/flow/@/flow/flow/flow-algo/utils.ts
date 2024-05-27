/**
 * Utility function that takes items from the inputted array until the predicate returns false
 */
export const takeWhile = <T>(
	arr: Iterable<T>,
	predicate: (item: T) => boolean,
): T[] => {
	const results: T[] = [];
	for (const item of arr) {
		if (!predicate(item)) {
			break;
		}
		results.push(item);
	}
	return results;
};

export const uniqueWith = <T>(
	arr: T[],
	fn: (left: T, right: T) => boolean,
): T[] => {
	const unique: T[] = [];
	for (const left of arr) {
		if (!unique.some((right) => fn(left, right))) {
			unique.push(left);
		}
	}
	return unique;
};

export const minAllBy = <T>(arr: T[], fn: (item: T) => number): T[] => {
	let min = Infinity;
	for (const item of arr) {
		const value = fn(item);
		if (value < min) {
			min = value;
		}
	}
	return arr.filter((item) => fn(item) === min);
};
