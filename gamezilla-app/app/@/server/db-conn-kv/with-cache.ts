import { Result, Ok } from "gamezilla-app/@/core";
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
			logger.info(`HITTING SOURCE get: key=${key}`);
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
					`CACHED duration=${durationInMicroseconds}µs getMany: keys=${keysString}`,
				);
				return cacheGot;
			}
			logger.info(`HITTING SOURCE getMany: keys=${keys.join(", ")}`);
			const sourceGot = await source.getMany(keys, parser);
			const sourceHit = Result.withDefault(sourceGot, []);
			if (sourceHit.length > 0) {
				await cache.setMany(
					sourceHit.map((value, i) => [keys[i], value] as [string, unknown]),
				);
			}
			const end = process.hrtime.bigint();
			const durationInMicroseconds = (end - start) / BigInt(1000);
			const keyString = keys.join(", ");
			logger.info(
				`duration=${durationInMicroseconds}µs getMany: keys=${keyString}`,
			);
			return sourceGot;
		},
		async set(key, value) {
			await source.set(key, value);
			return cache.set(key, value);
		},
		async setMany(entries) {
			await source.setMany(entries);
			return cache.setMany(entries);
		},
		async zap(key) {
			await source.zap(key);
			return cache.zap(key);
		},
	};
};
