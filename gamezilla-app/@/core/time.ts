import type {Eff} from './eff';
import type {IO} from './io';
import {Posix} from './posix';
import {PubSub, Sub} from './sub';
import {TimeSpan} from './time-span';

//
//
//
//
//
//
//

const delay =
	<TMsg>(timeout: number, msg?: TMsg): IO<TMsg | null> =>
	async () => {
		await new Promise((resolve) =>
			setTimeout(resolve, timeout),
		);
		return msg ?? null;
	};

//
//
//
// Timeout
//
//
//

const timeouts = new Map<string | number, string | number>();

const startTimeout = <Msg>(
	timeoutId: string | number,
	duration: TimeSpan,
	msg: Msg,
): Eff<Msg> => {
	return (dispatch) => {
		timeouts.set(timeoutId, timeoutId);

		setTimeout(() => {
			if (timeouts.has(timeoutId)) {
				dispatch(msg);
				timeouts.delete(
					timeoutId,
				);
				return;
			}

			timeouts.delete(timeoutId);
		}, TimeSpan.toMilliseconds(duration));
	};
};

const cancelTimeout = (timeoutId: string | number): Eff => {
	return () => {
		timeouts.delete(timeoutId);
	};
};

//
//
//
// Interval
//
//
//

const intervals = new Map<string, PubSub<Posix>>();

const onTimeout = (intervalId: string, timeSpan: TimeSpan) => {
	const sub = intervals.get(intervalId);

	if (sub?.isSubbed()) {
		sub.pub(Posix.now());

		setTimeout(() => {
			onTimeout(intervalId, timeSpan);
		}, TimeSpan.toMilliseconds(timeSpan));

		return;
	}

	intervals.delete(intervalId);
};

const interval = <Msg>(
	intervalId: string,
	timeSpan: TimeSpan,
	f: (now: Posix) => Msg,
): Sub<Msg> => {
	const sub = intervals.get(intervalId);

	if (sub) {
		return Sub.map(sub, () => f(Posix.now()));
	}

	const subNew = PubSub.create<Posix>();

	intervals.set(intervalId, subNew);

	setTimeout(() => {
		onTimeout(intervalId, timeSpan);
	}, TimeSpan.toMilliseconds(timeSpan));

	return {
		sub(subscriber) {
			const unsub = subNew.sub(
				(msg) => {
					subscriber(
						f(
							msg,
						),
					);
				},
			);
			return () => {
				unsub();
			};
		},
	};
};

export const Time = {
	delay,
	startTimeout,
	cancelTimeout,
	interval,
};
