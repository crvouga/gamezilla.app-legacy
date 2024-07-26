import type {PubSub as IPubSub} from 'gamezilla-app/@/core';
import {p} from 'gamezilla-app/@/core/parser';
import type {IDbConnSql} from '../db-conn-sql';
import type {ILogger} from '../logger/logger';

export type Deps<T> = {
	dbConnSql: IDbConnSql;
	logger: ILogger;
	channel: string;
	encode: (msg: T) => string;
	decode: (msg: string | null) => T;
};

export const PubSub = <T>({
	dbConnSql,
	channel,
	logger,
	encode,
	decode,
}: Deps<T>): IPubSub<T> => {
	const runningSubscriberId = 0;

	const subscribers = new Map<number, (msg: T) => void>();

	const instanceId = Math.random().toString(36).substring(2);
	const SEPERATOR = '___';

	dbConnSql.query(p.unknown, `LISTEN ${channel}`, {});

	dbConnSql.onNotification((notification) => {
		if (notification.channel !== channel) {
			return;
		}

		if (notification.payload === undefined) {
			return;
		}

		const [payloadInstanceId, payload] =
			notification.payload.split(
				SEPERATOR,
			);

		if (payloadInstanceId === instanceId) {
			return;
		}

		if (!payload) {
			return;
		}

		logger.info(
			`recieved notification channel=${channel} instanceId=${instanceId} payload=${payload?.slice(
				0,
				100,
			)}`,
		);

		const msg = decode(payload ?? null);

		for (const subscriber of subscribers.values()) {
			subscriber(msg);
		}
	});

	return {
		once(_subscriber) {
			throw new Error(
				'Method not implemented.',
			);
		},
		pub(msg) {
			const payload = encode(msg);
			dbConnSql.query(
				p.unknown,
				`NOTIFY ${channel}, '${instanceId}${SEPERATOR}${payload}'`,
				{},
			);
		},

		isSubbed() {
			return subscribers.size > 0;
		},

		sub(subscriber) {
			const subscriberId =
				runningSubscriberId +
				1;

			subscribers.set(
				subscriberId,
				subscriber,
			);

			return () => {
				subscribers.delete(
					subscriberId,
				);
			};
		},
	};
};
