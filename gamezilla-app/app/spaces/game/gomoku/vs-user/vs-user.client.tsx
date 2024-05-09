import type { ClientCtx } from "gamezilla-app/app/@/client";
import { Eff, Sub } from "gamezilla-app/@/core";
import {
	type ModelClient,
	type MsgClient,
	type ModelServer,
	type MsgToClient,
	initShared,
} from "./vs-user.types";

//
//
//
// model
//
//
//

export type Model = ModelClient;

export const init = initShared;

//
//
//
// update
//
//
//

export type Msg = MsgClient;

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
	if (msg.t === "clicked-cancel") {
		return { model: { ...model, confirming: undefined } };
	}

	if (msg.t === "resign") {
		if (model.confirming === "resign") {
			return { model, eff: Eff.None };
		}

		return { model: { ...model, confirming: "resign" } };
	}

	return { model, eff: Eff.None };
};

export const updateFromServer = ({
	msg,
	model,
}: {
	msg: MsgToClient;
	model: Model;
}): {
	model: Model;
	eff?: Eff<Msg>;
} => {
	if (msg.t === "input-move") {
		if (msg.result.t === "err") {
			return { model };
		}
		const merged = mergeWithServer({
			serverModel: msg.result.value,
			clientModel: model,
		});

		return { model: merged };
	}

	if (msg.result.t === "err") {
		return { model };
	}

	const merged = mergeWithServer({
		serverModel: msg.result.value,
		clientModel: model,
	});

	return { model: merged };
};

export const mergeWithServer = ({
	serverModel,
}: {
	clientModel: ModelClient;
	serverModel: ModelServer;
}): ModelClient => {
	return serverModel;
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

//
//
//
// view
//
//
//

export const View = (_props: {
	dispatch: (m: Msg) => void;
	ctx: ClientCtx;
	model: Model;
	onCancel: () => void;
}) => {
	return <div />;
};
