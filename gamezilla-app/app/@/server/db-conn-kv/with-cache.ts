import { Result } from "gamezilla-app/@/core";
import { ILogger } from "../logger";
import { IDbConnKv } from "./db-conn-kv";

export const withCache = ({
	cache,
	source,
	logger,
}: {
	cache: IDbConnKv;
	source: IDbConnKv;
	logger: ILogger;
}): IDbConnKv => {
	return {
		async get(key, parser) {
			const start = process.hrtime.bigint();

			const cacheGot = await cache.get(key, parser);
			const cacheHit = Result.withDefault(cacheGot, null);
			if (cacheHit) {
				const end = process.hrtime.bigint();
				const durationInMicroseconds = (end - start) / BigInt(1000);
				logger.info(
					`CACHED duration=${durationInMicroseconds}µs get: key=${key}`,
				);
				return cacheGot;
			}
			logger.info(`HITTING SOURCE getMany: key=${key}`);
			const sourceGot = await source.get(key, parser);
			const sourceHit = Result.withDefault(sourceGot, null);
			if (sourceHit) {
				await cache.set(key, sourceHit);
			}
			const end = process.hrtime.bigint();
			const durationInMicroseconds = (end - start) / BigInt(1000);
			logger.info(`duration=${durationInMicroseconds}µs get: key=${key}`);
			return sourceGot;
		},
		async getMany(keys, parser) {
			const start = process.hrtime.bigint();

			const cacheGot = await cache.getMany(keys, parser);
			const cacheHit = Result.withDefault(cacheGot, null);
			if (cacheHit) {
				const end = process.hrtime.bigint();
				const durationInMicroseconds = (end - start) / BigInt(1000);
				const keysString = keys.join(", ");
				logger.info(
					`CACHED duration=${durationInMicroseconds}µs get: keys=${keysString}`,
				);
				return cacheGot;
			}
			logger.info(`HITTING SOURCE getMany: keys=${keys.join(", ")}`);
			const sourceGot = await source.getMany(keys, parser);
			const sourceHit = Result.withDefault(sourceGot, null);
			if (sourceHit) {
				await cache.setMany(
					sourceHit.map((value, i) => [keys[i], value] as [string, unknown]),
				);
			}
			const end = process.hrtime.bigint();
			const durationInMicroseconds = (end - start) / BigInt(1000);
			logger.info(
				`duration=${durationInMicroseconds}µs get: keys=${keys.join(", ")}`,
			);
			return sourceGot;
		},
		async set(key, value) {
			source.set(key, value);

			return cache.set(key, value);
		},
		async setMany(entries) {
			let key = "";
			for (let i = 0; i < entries.length; i++) {
				key = `${key},${entries[i]?.[0]}`;
			}

			source.setMany(entries);

			return cache.setMany(entries);
		},
		async zap(key) {
			source.zap(key);

			return cache.zap(key);
		},
	};
};
