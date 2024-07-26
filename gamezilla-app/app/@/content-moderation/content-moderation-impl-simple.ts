import {Result} from 'gamezilla-app/@/core';

export type ContentModeration = {
	isBad: (text: string) => Promise<Result<string, boolean>>;
};
