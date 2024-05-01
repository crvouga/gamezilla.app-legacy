import type { ClientId, SessionId } from "gamezilla-app/app/@shared/data";
import type {
	ServerCmd,
	ServerCtx,
	ServerEvent,
	WireCmd,
} from "gamezilla-app/app/@shared/server";
import { Eff, isErr } from "gamezilla-app/@shared/core";
import type { Sub } from "gamezilla-app/@shared/core/sub";
import { CappedOrderedDict } from "gamezilla-app/@shared/capped-ordered-dict/capped-ordered-dict";
import { AppServerModule } from "../@shared/architecture/app-server";
import type { IDbConnKv } from "../@shared/server/db-conn-kv";
import type { IServerTransport } from "./transport-server";
import { type IWireSessionDb, WireSessionDb } from "./wire-session-db";
import type {
	Client,
	ModelServer,
	MsgServer,
	MsgToClient,
	MsgToServer,
} from "./wire.core";

//
//
//
//
//
//

export type Deps<TMsgToClient, TMsgToServer> = {
	WireSessionDb: IWireSessionDb;
	transport: IServerTransport<{
		MsgToClient: TMsgToClient;
		MsgToServer: TMsgToServer;
	}>;
};

export const getDeps = async <TMsgToClient, TMsgToServer>(input: {
	transport: IServerTransport<{
		MsgToClient: TMsgToClient;
		MsgToServer: TMsgToServer;
	}>;
	dbConnKv: IDbConnKv;
}): Promise<Deps<TMsgToClient, TMsgToServer>> => {
	return {
		transport: input.transport,
		WireSessionDb: await WireSessionDb({
			t: "db-conn-kv",
			dbConnKv: input.dbConnKv,
		}),
	};
};

//
//
//
//
//
//
//

export const init = async (): Promise<{
	model: ModelServer;
	eff: Eff<MsgServer>;
}> => {
	return {
		model: null,
		eff: Eff.None,
	};
};

//
//
//
//
//
//

type Input<TMsgToClient, TMsgToServer> = {
	ctx: ServerCtx;
	model: ModelServer;
	//
	msg?: MsgServer | null;
	msgClient?: MsgToServer | null;
	msgEvt?: ServerEvent | null;
	msgCmd?: WireCmd<TMsgToClient> | null;
	//
	deps: Deps<TMsgToClient, TMsgToServer>;
};

type Output = {
	model: ModelServer;
	eff?: Eff<MsgServer>;
	msgEvt?: ServerEvent[];
	msgCmd?: ServerCmd<MsgToClient>[];
};

//
//
//
//

export const update = async <TMsgToClient, TMsgToServer>(
	input: Input<TMsgToClient, TMsgToServer>,
): Promise<Output> => {
	return AppServerModule.andThen(
		{ model: input.model },
		(model) => updateFromMsg({ ...input, model }),
		(model) => updateFromClient({ ...input, model }),
		(model) => updateFromCmd({ ...input, model }),
		(model) => updateFromEvent({ ...input, model }),
	);
};

const updateFromMsg: typeof update = async ({ msg, model, ctx, deps }) => {
	if (!msg) {
		return { model };
	}

	switch (msg.t) {
		case "client-connected": {
			return AppServerModule.andThen({ model }, async (model) => {
				const gotExisting = await deps.WireSessionDb.clients.findBySessionIds([
					msg.sessionId,
				]);

				const maybeExisting: Client | null =
					gotExisting.t === "ok" ? gotExisting.value[0] ?? null : null;

				const existing: Client = maybeExisting ?? {
					clientIds: CappedOrderedDict.init({ maxSize: 10 }),
					sessionId: msg.sessionId,
				};

				const clientNew: Client = {
					sessionId: msg.sessionId,
					clientIds: CappedOrderedDict.add(
						existing.clientIds,
						msg.clientId,
						msg.clientId,
					),
				};

				const set = await deps.WireSessionDb.clients.set(
					msg.sessionId,
					clientNew,
				);

				if (isErr(set)) {
					return { model };
				}

				const msgEvt: ServerEvent[] = [
					{
						t: "wire/client-connected",
						clientId: msg.clientId,
						sessionId: msg.sessionId,
					},
				];

				return {
					model,
					msgEvt,
				};
			});
		}

		case "client-disconnected": {
			const msgEvt: ServerEvent[] = [
				{
					t: "wire/client-disconnected",
					clientId: msg.clientId,
					sessionId: msg.sessionId,
				},
			];
			return {
				model,
				msgEvt: msgEvt,
			};
		}

		case "server-started": {
			return {
				model,
			};
		}

		case "got-bad-msgs": {
			ctx.logger.warn(
				`Got bad msg from client. reason=${msg.reason}, client's clientId=${msg.clientId}, client's sessionId=${msg.sessionId}`,
			);
			return {
				model,
			};
		}
	}
};

const updateFromEvent: typeof update = async ({ deps, msgEvt, model }) => {
	if (!msgEvt) {
		return { model };
	}
	switch (msgEvt.t) {
		case "auth/client-authenticated": {
			const foundSessionIds = await deps.WireSessionDb.sessionIds.findByUserIds(
				[msgEvt.account.userId],
			);
			const sessionIds =
				foundSessionIds.t === "ok" ? foundSessionIds.value : [];

			const sessionIdsNew = [...new Set([...sessionIds, msgEvt.sessionId])];

			await deps.WireSessionDb.sessionIds.set(
				msgEvt.account.userId,
				sessionIdsNew,
			);

			return { model };
		}
		default: {
			return { model };
		}
	}
};

const updateFromClient: typeof update = async ({ model }) => {
	return { model };
};

const updateFromCmd = async <TMsgToClient, TMsgToServer>({
	msgCmd,
	model,
	deps,
	ctx,
}: Input<TMsgToClient, TMsgToServer>): Promise<Output> => {
	if (!msgCmd) {
		return { model };
	}

	const msgCmdChild = msgCmd.c;

	switch (msgCmdChild.t) {
		case "broadcast": {
			return {
				model,
				eff: () => {
					deps.transport.toClientBroadcast.publish([msgCmdChild.msg]);
				},
			};
		}

		case "send-to-client": {
			return {
				model,
				eff: () => {
					const toClientPayload: {
						[clientId: ClientId]: {
							clientId: ClientId;
							msgs: TMsgToClient[];
						};
					} = {};

					if (msgCmdChild.clientIds.length === 0) {
						ctx.logger.warn(`${msgCmdChild.t} failed. No client ids provided`);
						return;
					}

					for (const clientId of msgCmdChild.clientIds) {
						toClientPayload[clientId] = {
							clientId,
							msgs: [msgCmdChild.msg],
						};
					}

					deps.transport.toClient.publish(toClientPayload);
				},
			};
		}

		case "send-to-user": {
			const gotSessionIds = await deps.WireSessionDb.sessionIds.findByUserIds(
				msgCmdChild.userIds,
			);

			const sessionIds = gotSessionIds.t === "ok" ? gotSessionIds.value : [];

			return {
				model,
				eff: () => {
					sendToSession({
						ctx,
						sessionIds,
						msg: msgCmdChild.msg,
						deps,
					});
				},
			};
		}

		case "send-to-session": {
			return {
				model,
				eff: () => {
					sendToSession({
						ctx,
						sessionIds: msgCmdChild.sessionIds,
						msg: msgCmdChild.msg,
						deps,
					});
				},
			};
		}

		case "topic-publish": {
			return {
				model,
				eff: () => {},
			};
		}

		case "topic-subscribe": {
			return { model };
		}
	}
};

const sendToSession = async <TMsgToClient, TMsgToServer>({
	ctx,
	sessionIds,
	deps,
	msg,
}: {
	ctx: ServerCtx;
	msg: TMsgToClient;
	sessionIds: SessionId[];
	deps: Deps<TMsgToClient, TMsgToServer>;
}) => {
	const toClientPayload: {
		[clientId: ClientId]: {
			clientId: ClientId;
			msgs: TMsgToClient[];
		};
	} = {};

	if (sessionIds.length === 0) {
		ctx.logger.warn("send to session failed. no sessionIds provided");
		return;
	}

	const gotClients =
		await deps.WireSessionDb.clients.findBySessionIds(sessionIds);

	const clients = gotClients.t === "ok" ? gotClients.value : [];

	for (const client of clients) {
		const clientIds = CappedOrderedDict.valuesNewestFirst(client.clientIds);

		if (clientIds.length === 0) {
			ctx.logger.warn(
				`send to session failed. no client ids for sessionId=${client.sessionId}`,
			);
			continue;
		}

		for (const clientId of clientIds) {
			toClientPayload[clientId] = {
				clientId,
				msgs: [...(toClientPayload[clientId]?.msgs ?? []), msg],
			};
		}
	}

	deps.transport.toClient.publish(toClientPayload);
};

export const subscriptions = <TMsgToServer, TMsgToClient>({
	transport,
}: {
	transport: IServerTransport<{
		MsgToClient: TMsgToClient;
		MsgToServer: TMsgToServer;
	}>;
}): Sub<MsgServer> => {
	return transport.wire;
};
