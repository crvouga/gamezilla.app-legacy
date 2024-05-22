import type {
	AnonymousClientCtx,
	ClientEvent,
} from "gamezilla-app/app/@/client";

import { Eff, batchMsgs, type Sub } from "gamezilla-app/@/core";
import type { VDom } from "gamezilla-app/@/vdom";
import type { WithEventId } from "../@/event";
import type { Space } from "../@/space";
import type { SpaceClientCmd } from "../@/space-client-cmd";
import type { SpaceEvent } from "../spaces-core";
import type {
	ModelClient,
	MsgClient,
	MsgToClient,
	MsgToServer,
} from "../spaces.types";

type Ctx = AnonymousClientCtx & {
	space?: Space;
};

export type Input = {
	ctx: Ctx;
	model: ModelClient;
	
	msg?: MsgClient | null;
	msgServer?: MsgToClient | null;
	msgEvt?: ClientEvent | null;
	msgCmd?: SpaceClientCmd<{
		MsgClient: MsgClient;
		MsgToServer: MsgToServer;
	}> | null;
	msgSpaceEvent?: WithEventId<SpaceEvent> | null;
};

export type MaybePromise<T> = T | Promise<T>;

export type Output = {
	model: ModelClient;
	eff?: Eff<MsgClient>;
	msgCmd?: SpaceClientCmd<{
		MsgClient: MsgClient;
		MsgToServer: MsgToServer;
	}>[];
	msgEvt?: unknown[];
	msgSpaceEvent?: WithEventId<SpaceEvent>[];
};

export type SpaceClientModule = {
	init: (input: { ctx: Ctx; model: ModelClient }) => MaybePromise<Output>;
	update: (input: Input) => MaybePromise<Output>;
	subscriptions: (input: {
		ctx: Ctx;
		model: ModelClient;
	}) => MaybePromise<Sub<MsgClient>>;
	View: (input: {
		ctx: Ctx;
		model: ModelClient;
		dispatch: (msg: MsgClient) => void;
	}) => VDom;
};

const andThen = async (
	accPromise: MaybePromise<Output>,
	...updates: ((model: ModelClient) => MaybePromise<Output>)[]
): Promise<Output> => {
	const [update, ...rest] = updates;

	const acc = await accPromise;

	if (!update) {
		return acc;
	}

	const updated = await update(acc.model);

	const accNew: Output = {
		model: updated.model,
		eff: Eff.batch([acc.eff, updated.eff]),
		msgCmd: batchMsgs(acc.msgCmd, updated.msgCmd),
		msgEvt: batchMsgs(acc.msgEvt, updated.msgEvt),
		msgSpaceEvent: batchMsgs(acc.msgSpaceEvent, updated.msgSpaceEvent),
	};

	return andThen(accNew, ...rest);
};

export const SpaceClientModule = {
	andThen,
};
