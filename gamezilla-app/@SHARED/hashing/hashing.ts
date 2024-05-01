import type { Hash } from "./hash";
import type { HashingAlgo } from "./hashing-algo";

export type IHashing = {
	hash: (input: { password: string; algo: HashingAlgo }) => Promise<Hash>;
	check: (input: { password: string; hash: Hash }) => Promise<boolean>;
};
