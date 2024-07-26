import {Eff, type Sub} from 'gamezilla-app/@/core';
import type {ClientId, SessionId, UserId} from 'gamezilla-app/app/@/data';
import type {ServerCtx, ServerEvent} from 'gamezilla-app/app/@/server';
import type {WithEventId} from '../@/event';
import type {Space} from '../@/space';
import type {SpaceServerCmd} from '../@/space-server-cmd';
import type {SpaceCoreEvent} from '../spaces-core';
import type {
	ModelServer,
	MsgServer,
	MsgToClient,
	MsgToServer,
	ServerDeps,
} from '../spaces.types';
import {Msg} from 'gamezilla-app/@/core/msg';

type Ctx = ServerCtx & {
	space?: Space;
};

export type Input = {
	deps: ServerDeps;
	ctx: Ctx;
	model: ModelServer;
	msg?: MsgServer | null;
	msgClient?:
		| (MsgToServer & {
				clientId: ClientId;
				sessionId: SessionId;
				userId?: UserId | null;
		  })
		| null;
	msgEvt?: ServerEvent | null;
	msgCmd?: SpaceServerCmd<MsgToClient> | null;
	msgSpaceEvent?: WithEventId<SpaceCoreEvent> | null;
};

export type MaybePromise<T> = T | Promise<T>;

export type Output = {
	model: ModelServer;
	eff?: Eff<MsgServer>;
	msgCmd?: SpaceServerCmd<MsgToClient>[];
	msgEvt?: unknown[];
	msgSpaceEvent?: WithEventId<SpaceCoreEvent>[];
};

export type SpaceServerModule = {
	init: (input: {
		ctx: Ctx;
		model: ModelServer;
		deps: ServerDeps;
	}) => MaybePromise<Output>;
	update: (input: Input) => MaybePromise<Output>;
	subscriptions: (input: {
		ctx: Ctx;
		model: ModelServer;
		deps: ServerDeps;
	}) => MaybePromise<Sub<MsgServer>>;
};

const andThen = async (
	accPromise: MaybePromise<Output>,
	...updates: ((model: ModelServer) => MaybePromise<Output>)[]
): Promise<Output> => {
	let acc = await accPromise;
	for (const update of updates) {
		const updated = await update(acc.model);
		acc = {
			model: updated.model,
			eff: Eff.batch([
				acc.eff,
				updated.eff,
			]),
			msgCmd: Msg.batch(
				acc.msgCmd,
				updated.msgCmd,
			),
			msgEvt: Msg.batch(
				acc.msgEvt,
				updated.msgEvt,
			),
			msgSpaceEvent: Msg.batch(
				acc.msgSpaceEvent,
				updated.msgSpaceEvent,
			),
		};
	}

	return acc;
};

export const SpaceServerModule = {
	andThen,
};
