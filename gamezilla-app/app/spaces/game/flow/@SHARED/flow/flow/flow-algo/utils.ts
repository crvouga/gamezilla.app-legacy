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
