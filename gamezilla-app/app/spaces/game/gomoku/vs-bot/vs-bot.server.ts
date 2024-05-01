import type {
	SpaceReqCtx,
	SpaceServerEvent,
} from "gamezilla-app/app/spaces/@shared/space";
import { Eff, Sub, andThen, pipe } from "gamezilla-app/@shared/core";
import {
	type ModelServer,
	type MsgServer,
	type MsgToServer,
	handleBotMove,
	initShared,
} from "./vs-bot.core";

//
//
//
// model
//
//
//

export type Model = ModelServer;

export const init = initShared;

//
//
//
// update
//
//
//

export type Msg = MsgServer;

export const update = ({
	msg,
	model,
}: {
	msg: Msg;
	model: Model;
}): {
	model: Model;
	eff?: Eff<Msg>;
} => {
	switch (msg.t) {
		case "none": {
			return { model };
		}
	}
};

type updateFromClient = (input: {
	ctx: SpaceReqCtx;

	msg: MsgToServer;
	model: Model;
}) => {
	model: Model;
	eff?: Eff<Msg>;
};

export const updateFromClient: updateFromClient = (input) => {
	return pipe(
		input,
		andThen((model) => updateFromClient_({ ...input, model })),
		andThen((model) => updateBotMove({ ...input, model })),
	);
};

const updateBotMove: updateFromClient = ({ model }) => {
	const handled = handleBotMove(model);

	if (handled.t === "err") {
		return {
			model,
			eff: Eff.None,
		};
	}

	const modelNew = handled.value;

	return {
		model: modelNew,
	};
};

const updateFromClient_: updateFromClient = ({ msg, model }) => {
	switch (msg.t) {
		default: {
			return { model };
		}
	}
};

export const updateFromEvent = ({
	msg,
	model,
}: {
	msg: SpaceServerEvent;
	model: Model;
}): {
	model: Model;
	eff?: Eff<Msg>;
} => {
	if (msg.t === "user-joined") {
		return {
			model: init({ userId: model.userId }),
		};
	}

	return { model };
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
	return Sub.None;
};
