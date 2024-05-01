import { Ok } from "gamezilla-app/@shared/core";
import type { p } from "gamezilla-app/@shared/core/parser";
import type { IDbConnKv } from "./db-conn-kv";

export const DbConnKvHashMap = (config?: {
	map?: Map<string, unknown>;
}): IDbConnKv => {
	const hashMap = config?.map ?? new Map<string, unknown>();
	return {
		async get(key, parser) {
			const got = hashMap.get(key);

			const parsed = parser.parse(got);

			switch (parsed.t) {
				case "err":
					return Ok(null);
				case "ok":
					return Ok(parsed.value);
			}
		},

		async getMany<TValue>(keys: string[], parser: p.Parser<TValue>) {
			const rows: TValue[] = [];

			for (let i = 0; i < keys.length; i++) {
				const key = keys[i]!;
				const got = hashMap.get(key);
				if (!got) {
					continue;
				}
				const parsed = parser.parse(got);
				if (parsed.t === "ok") {
					rows.push(parsed.value);
				}
			}

			return Ok(rows);
		},

		async set(key, value) {
			hashMap.set(key, value);
			return Ok(null);
		},

		async setMany(entries) {
			for (let i = 0; i < entries.length; i++) {
				hashMap.set(entries[i]![0], entries[i]![1]);
			}
			return Ok(null);
		},

		async zap(key) {
			hashMap.delete(key);
			return Ok(null);
		},
	};
};
