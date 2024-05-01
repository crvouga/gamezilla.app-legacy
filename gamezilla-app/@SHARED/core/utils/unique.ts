/**
 * @example
 * const strEq = (s1, s2) => String(s1) === String(s2)
 * unique(strEq, [1, '1', 2, 1]) //=> [1, 2]
 * unique(strEq, [{}, {}])       //=> [{}]
 * unique(strEq, [1, '1', 1])    //=> [1]
 * unique(strEq, ['1', 1, 1])    //=> ['1']
 */
export const unique = <X>(eq: (a: X, b: X) => boolean, xs: X[]): X[] => {
	const items: X[] = [];

	for (const x of xs) {
		if (!items.some((item) => eq(item, x))) {
			items.push(x);
		}
	}

	return items;
};
