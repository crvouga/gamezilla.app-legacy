import type { ClientId, SessionId, UserId } from "gamezilla-app/app/@/data";
import type { ServerCtx, ServerEvent } from "gamezilla-app/app/@/server";
import { Eff, type Sub } from "gamezilla-app/@/core";
import type { WithEventId } from "../@/event";
import type { Space } from "../@/space";
import type { SpaceServerCmd } from "../@/space-server-cmd";
import type { SpaceEvent } from "../spaces-core";
import type {
	ModelServer,
	MsgServer,
	MsgToClient,
	MsgToServer,
	ServerDeps,
} from "../spaces.types";

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
	msgSpaceEvent?: WithEventId<SpaceEvent> | null;
};

export type MaybePromise<T> = T | Promise<T>;

export type Output = {
	model: ModelServer;
	eff?: Eff<MsgServer>;
	msgCmd?: SpaceServerCmd<MsgToClient>[];
	msgEvt?: unknown[];
	msgSpaceEvent?: WithEventId<SpaceEvent>[];
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
	const [update, ...rest] = updates;

	const acc = await accPromise;

	if (!update) {
		return acc;
	}

	const updated = await update(acc.model);

	const accNew: Output = {
		model: updated.model,
		eff: Eff.batch([acc.eff, updated.eff]),
		msgCmd: [...(acc.msgCmd ?? []), ...(updated.msgCmd ?? [])],
		msgEvt: [...(acc.msgEvt ?? []), ...(updated.msgEvt ?? [])],
		msgSpaceEvent: [
			...(acc.msgSpaceEvent ?? []),
			...(updated.msgSpaceEvent ?? []),
		],
	};

	return andThen(accNew, ...rest);
};

export const SpaceServerModule = {
	andThen,
};
