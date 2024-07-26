import {p} from '../core/parser';
import {HashValue} from './hash-value';
import {HashingAlgo} from './hashing-algo';

export const Hash = p.obj({
	value: HashValue,
	algo: HashingAlgo,
});
export type Hash = p.Infer<typeof Hash>;
