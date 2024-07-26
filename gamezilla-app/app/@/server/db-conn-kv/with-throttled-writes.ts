import {Ok, TimeSpan} from 'gamezilla-app/@/core';
import type {ILogger} from '../logger/logger';
import type {IDbConnKv} from './db-conn-kv';

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
	const timeouts = new Map<
		string,
		ReturnType<typeof setTimeout>
	>();
	const lastValues = new Map<string, unknown>();

	const scheduleSet = (key: string, value: unknown) => {
		if (!timeouts.has(key)) {
			timeouts.set(
				key,
				setTimeout(
					() => {
						const valueToSet =
							lastValues.get(
								key,
							);
						dbConnKv.set(
							key,
							valueToSet,
						);
						timeouts.delete(
							key,
						);
						lastValues.delete(
							key,
						);
					},
					throttleMs,
				),
			);
		}
		lastValues.set(key, value);
	};

	const scheduleSetMany = (entries: [string, unknown][]) => {
		const key = entries
			.map((entry) => entry[0])
			.join(',');
		if (!timeouts.has(key)) {
			timeouts.set(
				key,
				setTimeout(
					() => {
						const entriesToSet =
							lastValues.get(
								key,
							);
						dbConnKv.setMany(
							entriesToSet as [
								string,
								unknown,
							][],
						);
						timeouts.delete(
							key,
						);
						lastValues.delete(
							key,
						);
					},
					throttleMs,
				),
			);
		}

		lastValues.set(key, entries);
	};

	const flush = async () => {
		logger.info('Flushing throttled writes');
		for (const [
			key,
			timeout,
		] of timeouts.entries()) {
			clearTimeout(timeout);
			const valueToSet =
				lastValues.get(
					key,
				);
			if (
				valueToSet &&
				Array.isArray(
					valueToSet,
				) &&
				Array.isArray(
					valueToSet[0],
				)
			) {
				await dbConnKv.setMany(
					valueToSet,
				);
			} else {
				await dbConnKv.set(
					key,
					valueToSet,
				);
			}
			timeouts.delete(key);
			lastValues.delete(key);
		}
		logger.info('Flushed throttled writes');
	};

	process.on('SIGTERM', () => {
		flush();
		process.exit(0);
	});
	process.on('SIGINT', () => {
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
	};
};
