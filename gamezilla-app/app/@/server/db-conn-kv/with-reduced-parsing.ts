import { isErr } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { IDbConnKv } from "./db-conn-kv";

export const withReducedParsing = ({
	dbConnKv,
	verifiedKeys,
}: {
	dbConnKv: IDbConnKv;
	verifiedKeys: Set<string>;
}): IDbConnKv => {
	return {
		...dbConnKv,

		async get<TValue>(key: string, parser: p.Parser<TValue>) {
			if (verifiedKeys.has(key)) {
				return dbConnKv.get(key, p.noop<TValue>());
			}

			const got = await dbConnKv.get(key, parser);

			if (isErr(got)) {
				return got;
			}

			verifiedKeys.add(key);

			return got;
		},

		async getMany<TValue>(keys: string[], parser: p.Parser<TValue>) {
			const key = keys.join(",");

			if (verifiedKeys.has(key)) {
				return dbConnKv.getMany(keys, p.noop<TValue>());
			}

			const got = await dbConnKv.getMany(keys, parser);

			if (isErr(got)) {
				return got;
			}

			verifiedKeys.add(key);

			return got;
		},
	};
};
