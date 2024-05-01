import { describe, expect, it } from "bun:test";
import { Posix } from "gamezilla-app/@shared/core";
import { AppServerModule } from "gamezilla-app/app/@shared/architecture/app-server";
import { ClientId, SessionId } from "gamezilla-app/app/@shared/data";
import type { ServerCtx } from "gamezilla-app/app/@shared/server";
import { DbConnKvHashMap } from "gamezilla-app/app/@shared/server/db-conn-kv/db-conn-kv-impl-hash-map";
import { dbConnSqlNoop } from "gamezilla-app/app/@shared/server/db-conn-sql";
import { Logger } from "gamezilla-app/app/@shared/server/logger/logger-impl";
import { smsNoop } from "gamezilla-app/app/@shared/server/sms";
import { AccountDb } from "../@shared/server/account-db";
import { SessionDb } from "../@shared/server/session-db";
import type { ServerDeps, ServerModule } from "../auth.core";
import * as AuthServer from "../auth.server";

const ctx: ServerCtx = {
	sms: smsNoop,
	dbConnSql: dbConnSqlNoop,
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
