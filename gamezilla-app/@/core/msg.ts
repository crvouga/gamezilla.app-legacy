type NullishItems<T> = T | null | undefined | Array<NullishItems<T>>;

/**
 * @description
 * A helper function used for composing update functions together.
 */
const batch = <T>(...msgs: Array<NullishItems<T>>): Array<T> => {
	const flattened: Array<T> = [];

	const stack = [...msgs];

	while (stack.length > 0) {
		const item = stack.pop();

		if (Array.isArray(item)) {
			stack.push(...item);
		} else if (item !== null && item !== undefined) {
			flattened.push(item);
		}
	}

	return flattened.reverse();
};

export type Msg = {
	t: string;
};

export const Msg = {
	batch,
};
