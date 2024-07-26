import {Eff, type Sub, Time, isErr} from 'gamezilla-app/@/core';
import {TimeSpan} from 'gamezilla-app/@/core/time-span';
import {
	type ModelServer,
	type MsgServer,
	type MsgToServer,
	initShared,
	inputDrop,
	inputRotate,
	inputTranslate,
	mouseMove,
	tick,
} from './tetris.types';

//
//
//
// Model
//
//
//

export type Model = ModelServer;

export const init: Model = initShared;

//
//
//
// Update
//
//
//

export type Msg = MsgServer;

export const update = (msg: Msg, model: Model): [Model, Eff<Msg>] => {
	switch (msg[0]) {
		case 'tick': {
			const modelNext = tick(model);

			return [modelNext, Eff.None];
		}
	}
};

export const updateFromClient = (
	msg: MsgToServer,
	model: Model,
): [Model, Eff<Msg>] => {
	switch (msg[0]) {
		case 'MouseMove': {
			const toClient = mouseMove(
				msg,
				model,
			);

			if (toClient[1].t === 'err') {
				return [
					model,
					Eff.None,
				];
			}

			const modelNew =
				toClient[1]
					.value;

			return [modelNew, Eff.None];
		}

		case 'InputDrop': {
			const result = inputDrop(model);

			if (isErr(result)) {
				return [
					model,
					Eff.None,
				];
			}

			const modelNew = result.value;

			return [modelNew, Eff.None];
		}

		case 'InputTranslate': {
			const result = inputTranslate(
				msg[1],
				model,
			);

			if (isErr(result)) {
				return [
					model,
					Eff.None,
				];
			}

			const modelNew = result.value;

			return [modelNew, Eff.None];
		}

		case 'InputRotate': {
			const result =
				inputRotate(
					model,
				);

			if (isErr(result)) {
				return [
					model,
					Eff.None,
				];
			}

			const modelNew = result.value;

			return [modelNew, Eff.None];
		}
	}
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, _model: Model): Sub<Msg> => {
	return Time.interval(
		intervalId,
		TimeSpan.milliseconds(500),
		(): Msg => ['tick'],
	);
};
