import {Uuid} from 'gamezilla-app/@/core';
import type {Brand} from 'gamezilla-app/@/core/brand';
import {p} from 'gamezilla-app/@/core/parser';

export type UserId = Brand<string, 'UserId'>;

const parser = p.custom(is, 'Invalid user id');

const namespace = 'user';
const separator = ':';

function is(userId: unknown): userId is UserId {
	return typeof userId === 'string';
}

const generate = () => {
	const id = Uuid.generate();
	const userId = `${namespace}${separator}${id}`;

	if (is(userId)) {
		return userId;
	}

	throw new Error(
		'impossible condition. generated invalid user id.',
	);
};

export const UserId = {
	...parser,
	generate,
	is,
};
