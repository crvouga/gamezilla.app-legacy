import { describe, expect, it } from "bun:test";
import { Posix } from "gamezilla-app/@/core";
import { AppServerModule } from "gamezilla-app/app/@/architecture/app-server";
import { ClientId, SessionId } from "gamezilla-app/app/@/data";
import type { ServerCtx } from "gamezilla-app/app/@/server";
import { DbConnKvHashMap } from "gamezilla-app/app/@/server/db-conn-kv/db-conn-kv-impl-hash-map";
import { Logger } from "gamezilla-app/app/@/server/logger/logger-impl";
import { smsNoop } from "gamezilla-app/app/@/server/sms";
import { AccountDb } from "../@/server/account-db";
import { SessionDb } from "../@/server/session-db";
import type { ServerDeps, ServerModule } from "../auth.types";
import * as AuthServer from "../auth.server";
import { DbConnSqlNoop } from "gamezilla-app/app/@/server/db-conn-sql";

const ctx: ServerCtx = {
	sms: smsNoop,
	dbConnSql: DbConnSqlNoop(),
	dbConnKv: DbConnKvHashMap(),
	logger: Logger({ t: "noop" }),
	now: Posix.now(),
};

const getDeps: ServerModule["getDeps"] = async () => {
	return {
		AccountDb: AccountDb({
			t: "in-memory",
			delay: async () => {},
		}),
		SessionDb: SessionDb({
			t: "in-memory",
			delay: async () => {},
		}),
		timeout: () => new Promise((resolve) => resolve()),
	};
};

const clientClickedContinueAsGuestButton =
	(deps: ServerDeps, clientId: ClientId, sessionId: SessionId) =>
	async (model: null) => {
		return AuthServer.update({
			model,
			ctx,
			msgClient: {
				t: "guest.clicked-continue-as-guest-button",
				clientId,
				sessionId,
			},
			deps,
		});
	};

describe(import.meta.file, () => {
	it("should be able to handle request", async () => {
		const deps = await getDeps({ ctx });

		const clientId = ClientId.generate();

		const output = await AppServerModule.andThen(
			AuthServer.init({ ctx }),
			clientClickedContinueAsGuestButton(deps, clientId, SessionId.generate()),
		);

		expect(
			output.msgCmd?.some(
				(msgCmd) =>
					msgCmd.t === "wire" &&
					msgCmd.c.t === "send-to-client" &&
					msgCmd.c.clientIds.includes(clientId) &&
					msgCmd.c.msg.t === "guest.continue-as-guest-result",
			),
		).toBe(true);
	});

	it("should output a client authenitcated event", async () => {
		const deps = await getDeps({ ctx });

		const clientId = ClientId.generate();
		const sessionId = SessionId.generate();

		const output = await AppServerModule.andThen(
			AuthServer.init({ ctx }),
			clientClickedContinueAsGuestButton(deps, clientId, sessionId),
		);

		expect(
			output.msgEvt?.some(
				(msgEvt) =>
					msgEvt.t === "auth/client-authenticated" &&
					msgEvt.clientId === clientId &&
					msgEvt.sessionId === sessionId &&
					msgEvt.loggedIn,
			),
		).toBe(true);
	});

	it("should be able to find user id from session id after continuing as guest", async () => {
		const deps = await getDeps({ ctx });

		const clientId = ClientId.generate();
		const sessionId = SessionId.generate();

		await AppServerModule.andThen(
			AuthServer.init({ ctx }),
			clientClickedContinueAsGuestButton(deps, clientId, sessionId),
		);

		const userId = await AuthServer.toUserIdFromSessionId(deps, sessionId);

		expect(userId !== null).toBe(true);
	});
});
