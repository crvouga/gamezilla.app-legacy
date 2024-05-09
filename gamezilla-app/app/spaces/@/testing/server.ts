import { Posix } from "gamezilla-app/@/core";
import { LamportTimestamp } from "gamezilla-app/@/lamport-clock";
import {
	ClientId,
	SessionId,
	UserId,
	type SpaceId,
} from "gamezilla-app/app/@/data";
import type { ServerCtx } from "gamezilla-app/app/@/server";
import { DbConnKvHashMap } from "gamezilla-app/app/@/server/db-conn-kv/db-conn-kv-impl-hash-map";
import { DbConnSqlNoop } from "gamezilla-app/app/@/server/db-conn-sql";
import { Logger } from "gamezilla-app/app/@/server/logger";
import { AppServerFixture } from "gamezilla-app/app/@/server/server-test-env";
import { smsNoop } from "gamezilla-app/app/@/server/sms";
import { ProfileCache } from "../../profile-cache";
import { GameDb } from "../../space-game/space-game-db";
import type { Space } from "../../spaces-core";
import { SpacesDb } from "../../spaces-core/space-db";
import * as SpacesServer from "../../spaces.server";
import type { ModelServer, ServerDeps } from "../../spaces.types";
import { EventId } from "../event";

export const SpaceServerFixture = () => {
	const f = AppServerFixture();
	const deps = getDeps();
	const clientA = randomAuthenticatedClient();
	const clientB = randomAuthenticatedClient();
	const init = SpacesServer.init({ ctx });

	return {
		...f,
		init,
		deps,
		ctx,
		clientA,
		clientB,
	};
};

export const ctx: ServerCtx = {
	sms: smsNoop,
	dbConnSql: DbConnSqlNoop(),
	logger: Logger({ t: "noop" }),
	now: Posix.now(),
	dbConnKv: DbConnKvHashMap(),
};

export const init = () => {
	return SpacesServer.init({ ctx });
};

export const getDeps = (): ServerDeps => {
	const dbConnKv = DbConnKvHashMap();
	return {
		ProfileCache: ProfileCache({ t: "db-conn-kv", dbConnKv }),
		SpacesDb: SpacesDb({ t: "db-conn-kv", dbConnKv }),
		GameDb: GameDb({ t: "db-conn-kv", dbConnKv }),
	};
};

export const randomAuthenticatedClient = (): AuthenticatedClient => {
	return {
		clientId: ClientId.generate(),
		sessionId: SessionId.generate(),
		userId: UserId.generate(),
	};
};

export type AuthenticatedClient = {
	clientId: ClientId;
	sessionId: SessionId;
	userId: UserId;
};

export const userStartedSpace =
	(deps: ServerDeps, client: AuthenticatedClient, spaceId: SpaceId) =>
	(model: ModelServer) => {
		return SpacesServer.update({
			ctx,
			deps,
			model,
			msgClient: {
				t: "event",
				clientId: client.clientId,
				sessionId: client.sessionId,
				c: {
					t: "user-started-space",
					eventId: EventId.generate(),
					happenedAt: LamportTimestamp.fromNumber(0),
					spaceId,
					userId: client.userId,
				},
			},
		});
	};

export const userJoinedSpace =
	(deps: ServerDeps, client: AuthenticatedClient, spaceId: SpaceId) =>
	(model: ModelServer) => {
		return SpacesServer.update({
			ctx,
			deps,
			model,
			msgClient: {
				t: "event",
				clientId: client.clientId,
				sessionId: client.sessionId,
				c: {
					t: "user-joined-space",
					eventId: EventId.generate(),
					happenedAt: LamportTimestamp.fromNumber(1),
					spaceId,
					userId: client.userId,
				},
			},
		});
	};

export const authenticatedClientConnected =
	(deps: ServerDeps, client: AuthenticatedClient) => (model: ModelServer) => {
		return SpacesServer.update({
			ctx,
			deps,
			model,
			msgEvt: {
				t: "auth/client-authenticated",
				clientId: client.clientId,
				sessionId: client.sessionId,
				account: {
					createdAt: Posix.now(),
					role: "guest",
					userId: client.userId,
					phoneNumber: null,
				},
			},
		});
	};

export const clientCore =
	(deps: ServerDeps, client: AuthenticatedClient, space: Space.Model) =>
	(model: ModelServer) => {
		return SpacesServer.update({
			ctx,
			deps,
			model,
			msgClient: {
				t: "sync",
				clientId: client.clientId,
				sessionId: client.sessionId,
				space,
			},
		});
	};
