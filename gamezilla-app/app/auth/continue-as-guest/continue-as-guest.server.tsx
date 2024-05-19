import { Ok, Posix, Result, Task, isErr } from "gamezilla-app/@/core";
import { SessionId, UserId } from "gamezilla-app/app/@/data";
import type { UserAccount } from "gamezilla-app/app/@/data/account";
import { sendBack } from "gamezilla-app/app/@/server";
import type { ServerDeps, ServerModule } from "../auth.types";
import type { ModelServer } from "./continue-as-guest.types";

const initModel: ModelServer = null;

const continueAsGuest = async ({
	deps,
	now,
	sessionId,
}: {
	deps: ServerDeps;
	sessionId: SessionId;
	now: Posix;
}): Task<string, UserAccount> => {
	const existingGuestUserId =
		await deps.guestSessionMappingDb.findUserIdBySessionId(sessionId);

	if (isErr(existingGuestUserId)) {
		return existingGuestUserId;
	}

	const existingGuestAccount = Result.withDefault(
		await deps.accountDb.findOneByUserId({
			userId: existingGuestUserId.value,
		}),
		null,
	);

	const newGuestAccount: UserAccount = {
		role: "guest",
		userId: UserId.generate(),
		createdAt: now,
		phoneNumber: null,
	};

	const guestAccount: UserAccount = existingGuestAccount ?? newGuestAccount;

	await deps.guestSessionMappingDb.insert({
		guestUserId: guestAccount.userId,
		sessionId: sessionId,
	});

	const insertedAccount = existingGuestAccount
		? Ok(null)
		: await deps.accountDb.insert({ account: guestAccount });

	if (isErr(insertedAccount)) {
		return insertedAccount;
	}

	const insertedSession = await deps.sessionDb.insert({
		userId: guestAccount.userId,
		sessionId,
	});

	if (isErr(insertedSession)) {
		return insertedSession;
	}

	return Ok(guestAccount);
};

const update: ServerModule["update"] = async ({
	model,
	msgClient,
	deps,
	ctx,
}) => {
	switch (msgClient?.t) {
		case "guest.clicked-continue-as-guest-button": {
			const result = await continueAsGuest({
				deps,
				now: ctx.now,
				sessionId: msgClient.sessionId,
			});

			if (isErr(result)) {
				return {
					model,
					msgCmd: [
						sendBack(msgClient, {
							t: "guest.continue-as-guest-result",
							result: result,
						}),
					],
				};
			}

			return {
				model,
				msgCmd: [
					sendBack(msgClient, {
						t: "guest.continue-as-guest-result",
						result: Ok(result.value.userId),
					}),
				],
				msgEvt: [
					{
						t: "auth/client-authenticated",
						clientId: msgClient.clientId,
						account: result.value,
						sessionId: msgClient.sessionId,
						loggedIn: true,
					},
				],
			};
		}

		default: {
			return {
				model,
			};
		}
	}
};

export const ContinueAsGuestServer = {
	initModel,
	update,
};
