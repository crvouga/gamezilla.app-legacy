import type {
	SpaceReqCtx,
	SpaceServerEvent,
} from "gamezilla-app/app/spaces/@/space";
import { type Eff, Sub } from "gamezilla-app/@/core";
import {
	type ModelServer,
	type MsgServer,
	type MsgToServer,
	initShared,
} from "./vs-user.types";

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
	model,
}: {
	msg: Msg;
	model: Model;
}): {
	model: Model;
	eff?: Eff<Msg>;
} => {
	return { model };
};

export const updateFromClient = ({
	model,
}: {
	ctx: SpaceReqCtx;
	msg: MsgToServer;
	model: Model;
}): {
	model: Model;
	eff?: Eff<Msg>;
} => {
	return { model };
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
	if (msg.t === "user-left") {
		return { model: init(model) };
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
