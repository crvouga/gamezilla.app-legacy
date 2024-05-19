import { Ok, TimeSpan } from "gamezilla-app/@/core";
import type { ILogger } from "../logger/logger";
import { IDbConnKv } from "./db-conn-kv";

export const withThrottledWrites = ({
	dbConnKv,
	throttle,
	logger,
}: {
	dbConnKv: IDbConnKv;
	throttle: TimeSpan;
	logger: ILogger;
}): IDbConnKv => {
	const throttleMs = TimeSpan.toMilliseconds(throttle);
	const timeouts = new Map<string, ReturnType<typeof setTimeout>>();
	const lastValues = new Map<string, any[]>();

	const scheduleSet = (key: string, value: any) => {
		if (!timeouts.has(key)) {
			timeouts.set(
				key,
				setTimeout(() => {
					const valueToSet = lastValues.get(key);
					dbConnKv.set(key, valueToSet);
					timeouts.delete(key);
					lastValues.delete(key);
				}, throttleMs),
			);
		}
		lastValues.set(key, value);
	};

	const scheduleSetMany = (entries: [string, any][]) => {
		const key = entries.map((entry) => entry[0]).join(",");
		if (!timeouts.has(key)) {
			timeouts.set(
				key,
				setTimeout(() => {
					const entriesToSet = lastValues.get(key);
					dbConnKv.setMany(entriesToSet as [string, any][]);
					timeouts.delete(key);
					lastValues.delete(key);
				}, throttleMs),
			);
		}

		lastValues.set(key, entries);
	};

	const scheduleZap = (key: string) => {
		if (!timeouts.has(key)) {
			timeouts.set(
				key,
				setTimeout(() => {
					dbConnKv.zap(key);
					timeouts.delete(key);
				}, throttleMs),
			);
		}
	};

	const flush = async () => {
		logger.info("Flushing throttled writes");
		for (const [key, timeout] of timeouts.entries()) {
			clearTimeout(timeout);
			const valueToSet = lastValues.get(key);
			if (valueToSet && Array.isArray(valueToSet[0])) {
				await dbConnKv.setMany(valueToSet);
			} else {
				await dbConnKv.set(key, valueToSet);
			}
			timeouts.delete(key);
			lastValues.delete(key);
		}
		logger.info("Flushed throttled writes");
	};

	process.on("SIGTERM", () => {
		flush();
		process.exit(0);
	});
	process.on("SIGINT", () => {
		flush();
		process.exit(0);
	});

	return {
		...dbConnKv,
		async set(key, value) {
			scheduleSet(key, value);
			return Ok(null);
		},
		async setMany(entries) {
			scheduleSetMany(entries);
			return Ok(null);
		},
		async zap(key) {
			scheduleZap(key);
			return Ok(null);
		},
	};
};
