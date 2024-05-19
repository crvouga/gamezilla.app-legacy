import { Eff, Sub, TimeSpan, isErr, isOk } from "gamezilla-app/@/core";
import { AppServerModule } from "gamezilla-app/app/@/architecture/app-server";
import type { SessionId, UserId } from "gamezilla-app/app/@/data";
import { ServerCmd, sendToClient } from "gamezilla-app/app/@/server";
import { AccountDb } from "./@/server/account-db";
import { SessionDb } from "./@/server/session-db";
import { AuthSMSServer } from "./auth-sms/auth-sms.server";
import type { MsgToClient, ServerDeps, ServerModule } from "./auth.types";
import { ContinueAsGuestServer } from "./continue-as-guest/continue-as-guest.server";
import { GuestSessionMappingDb } from "./continue-as-guest/guest-session-mapping-db";
import { LogoutServer } from "./logout/logout.server";

//
//
//
//
//

export const getDeps: ServerModule["getDeps"] = async ({ ctx }) => {
	return {
		accountDb: AccountDb({
			t: "postgres",
			dbConnSql: ctx.dbConnSql,
		}),
		sessionDb: SessionDb({
			t: "postgres-with-db-kv-cache",
			dbConnSql: ctx.dbConnSql,
			dbConnKv: ctx.dbConnKv,
		}),
		guestSessionMappingDb: GuestSessionMappingDb({
			t: "postgres",
			dbConnSql: ctx.dbConnSql,
		}),
		timeout: (timeSpan) =>
			new Promise((resolve) =>
				setTimeout(resolve, TimeSpan.toMilliseconds(timeSpan)),
			),
	};
};

export type Deps = Awaited<ReturnType<typeof getDeps>>;

//
//
//
// Model
//
//
//

export const init: ServerModule["init"] = async (input) => {
	const sms = await AuthSMSServer.init({ ...input, stored: null });

	return {
		model: null,
		eff: Eff.tag("sms", sms.eff),
		msgCmd: ServerCmd.tag("sms", sms.msgCmd),
		msgEvt: [],
	};
};

//
//
//
// Update
//
//
//

export const update: ServerModule["update"] = async (input) => {
	return AppServerModule.andThen(
		{ model: input.model },
		(model) => updateFromEvent({ ...input, model }),
		(model) => updateChild({ ...input, model }),
		(model) => LogoutServer.update({ ...input, model }),
		(model) => ContinueAsGuestServer.update({ ...input, model }),
	);
};

export const toUserIdFromSessionId = async (
	deps: ServerDeps,
	sessionId: SessionId,
): Promise<UserId | null> => {
	const found = await deps.sessionDb.findUserIdBySessionId(sessionId);

	if (isErr(found)) {
		return null;
	}

	const userId = found.value;

	return userId;
};

const updateChild: ServerModule["update"] = async (input) => {
	const sms = await AuthSMSServer.update({
		...input,
		deps: await AuthSMSServer.getDeps(input),
		msgClient:
			input.msgClient?.t === "sms"
				? { ...input.msgClient, ...input.msgClient.c }
				: null,
		msg: input.msg?.t === "sms" ? input.msg.c : null,
	});

	return {
		model: null,
		eff: Eff.tag("sms", sms.eff),
		msgCmd: ServerCmd.tag("sms", sms.msgCmd),
		msgEvt: sms.msgEvt,
	};
};

const updateFromEvent: typeof update = async ({ msgEvt, model, deps }) => {
	switch (msgEvt?.t) {
		case "wire/client-connected": {
			const foundUserId = await deps.sessionDb.findUserIdBySessionId(
				msgEvt.sessionId,
			);

			const userId = isOk(foundUserId) ? foundUserId.value : null;

			const foundAccount = await deps.accountDb.findOneByUserId({ userId });

			const account = isOk(foundAccount) ? foundAccount.value : null;

			if (!account) {
				return {
					model,
					msgEvt: [
						{
							t: "auth/client-unauthenticated",
							clientId: msgEvt.clientId,
							sessionId: msgEvt.sessionId,
						},
					],
				};
			}

			return {
				model: model,
				msgEvt: [
					{
						clientId: msgEvt.clientId,
						sessionId: msgEvt.sessionId,
						account: account,
						t: "auth/client-authenticated",
					},
				],
			};
		}

		case "auth/client-unauthenticated": {
			return {
				model,
				msgCmd: [
					sendToClient([msgEvt.clientId], {
						t: "client-unauthenticated",
						sessionId: msgEvt.sessionId,
					}),
				],
			};
		}

		case "auth/client-authenticated": {
			const msgCmd = sendToClient<MsgToClient>([msgEvt.clientId], {
				t: "client-authenticated",
				account: msgEvt.account,
				loggedIn: msgEvt.loggedIn ?? false,
			});

			if (!msgEvt.loggedIn) {
				return {
					model,
					msgCmd: [msgCmd],
				};
			}

			const inserted = await deps.sessionDb.insert({
				sessionId: msgEvt.sessionId,
				userId: msgEvt.account.userId,
			});

			if (isErr(inserted)) {
				return { model };
			}

			return {
				model,
				msgCmd: [msgCmd],
			};
		}

		default: {
			return { model };
		}
	}
};

//
//
//
//
//
//
//
//

export const subscriptions: ServerModule["subscriptions"] = async (input) => {
	return Sub.batch([
		Sub.tag(
			"sms",
			await AuthSMSServer.subscriptions({
				...input,
				model: null,
				deps: await AuthSMSServer.getDeps(input),
			}),
		),
	]);
};
