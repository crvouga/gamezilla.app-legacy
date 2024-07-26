import {TimeSpan} from './time-span';

export type Sleep = (timeSpan: TimeSpan) => Promise<void>;

export const sleep: Sleep = (timeSpan) => {
	return new Promise((resolve) =>
		setTimeout(
			resolve,
			TimeSpan.toMilliseconds(
				timeSpan,
			),
		),
	);
};
