import type {BaseClientCtx, ClientEvent} from 'gamezilla-app/app/@/client';

import {Eff, type Sub, batchMsgs} from 'gamezilla-app/@/core';
import type {VDom} from 'gamezilla-app/@/vdom';
import type {WithEventId} from '../@/event';
import type {Space} from '../@/space';
import type {SpaceClientCmd} from '../@/space-client-cmd';
import type {SpaceCoreEvent} from '../spaces-core';
import type {
	ModelClient,
	MsgClient,
	MsgToClient,
	MsgToServer,
} from '../spaces.types';

type Ctx = BaseClientCtx & {
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
	msgSpaceEvent?: WithEventId<SpaceCoreEvent> | null;
};

export type Output = {
	model: ModelClient;
	eff?: Eff<MsgClient>;
	msgCmd?: SpaceClientCmd<{
		MsgClient: MsgClient;
		MsgToServer: MsgToServer;
	}>[];
	msgEvt?: unknown[];
	msgSpaceEvent?: WithEventId<SpaceCoreEvent>[];
};

export type SpaceClientModule = {
	init: (input: {ctx: Ctx; model: ModelClient}) => Output;
	update: (input: Input) => Output;
	subscriptions: (input: {
		ctx: Ctx;
		model: ModelClient;
	}) => Sub<MsgClient>;
	View: (input: {
		ctx: Ctx;
		model: ModelClient;
		dispatch: (msg: MsgClient) => void;
	}) => VDom;
};

const andThen = (
	acc: Output,
	...updates: ((model: ModelClient) => Output)[]
): Output => {
	for (const update of updates) {
		const updated = update(acc.model);
		acc = {
			model: updated.model,
			eff: Eff.batch([
				acc.eff,
				updated.eff,
			]),
			msgCmd: batchMsgs(
				acc.msgCmd,
				updated.msgCmd,
			),
			msgEvt: batchMsgs(
				acc.msgEvt,
				updated.msgEvt,
			),
			msgSpaceEvent: batchMsgs(
				acc.msgSpaceEvent,
				updated.msgSpaceEvent,
			),
		};
	}
	return acc;
};

export const SpaceClientModule = {
	andThen,
};
