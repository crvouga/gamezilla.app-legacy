import type {
	ClientId,
	SessionId,
	UserId,
} from "gamezilla-app/app/@shared/data";
import type { ServerCtx, ServerEvent } from "gamezilla-app/app/@shared/server";
import { Eff, type Sub } from "gamezilla-app/@shared/core";
import type { WithEventId } from "../@shared/event";
import type { Space } from "../@shared/space";
import type { SpaceServerCmd } from "../@shared/space-server-cmd";
import type { SpaceEvent } from "../spaces-core";
import type {
	ModelServer,
	MsgServer,
	MsgToClient,
	MsgToServer,
	ServerDeps,
} from "../spaces.core";

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
