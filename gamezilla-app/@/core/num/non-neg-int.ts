import { Num } from "./num";

export type NonNegInt = Num & {
	NonNegInt: "NonNegInt";
	_value: number;
};

const of = (number: number): NonNegInt => {
	const num = Num.init(Math.floor(Math.abs(number)));

	return {
		...num,
		NonNegInt: "NonNegInt",
	};
};

const add = (a: NonNegInt, b: NonNegInt): NonNegInt => {
	return of(a._value + b._value);
};

const sub = (a: NonNegInt, b: NonNegInt): NonNegInt => {
	return of(a._value - b._value);
};

const inc = (a: NonNegInt): NonNegInt => {
	return of(a._value + 1);
};

const mul = (a: NonNegInt, b: NonNegInt): NonNegInt => {
	return of(a._value * b._value);
};

const str = (a: NonNegInt): string => {
	return `NonNegInt:${a._value}`;
};

export const NonNegInt = {
	sub,
	add,
	of,
	inc,
	mul,
	str,
};
