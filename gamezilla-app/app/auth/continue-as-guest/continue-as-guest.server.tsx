import { Ok, Result, isErr } from "gamezilla-app/@/core";
import { UserId } from "gamezilla-app/app/@/data";
import type { UserAccount } from "gamezilla-app/app/@/data/account";
import { sendBack } from "gamezilla-app/app/@/server";
import type { ServerModule } from "../auth.types";
import type { ModelServer } from "./continue-as-guest.types";

const initModel: ModelServer = null;

const update: ServerModule["update"] = async ({
	model,
	msgClient,
	deps,
	ctx,
}) => {
	switch (msgClient?.t) {
		case "guest.clicked-continue-as-guest-button": {
			const existingGuestUserId = Result.withDefault(
				await deps.guestSessionMappingDb.findUserIdBySessionId(
					msgClient.sessionId,
				),
				null,
			);

			const existingGuestAccount = Result.withDefault(
				await deps.accountDb.findOneByUserId({
					userId: existingGuestUserId,
				}),
				null,
			);

			const newGuestAccount: UserAccount = {
				role: "guest",
				userId: UserId.generate(),
				createdAt: ctx.now,
				phoneNumber: null,
			};

			const guestAccount = existingGuestAccount ?? newGuestAccount;

			await deps.guestSessionMappingDb.insert({
				guestUserId: guestAccount.userId,
				sessionId: msgClient.sessionId,
			});

			const insertedAccount = existingGuestAccount
				? Ok(null)
				: await deps.accountDb.insert({ account: guestAccount });

			if (isErr(insertedAccount)) {
				return {
					model,
					msgCmd: [
						sendBack(msgClient, {
							t: "guest.continue-as-guest-result",
							result: insertedAccount,
						}),
					],
				};
			}

			const insertedSession = await deps.sessionDb.insert({
				userId: guestAccount.userId,
				sessionId: msgClient.sessionId,
			});

			if (isErr(insertedSession)) {
				return {
					model,
					msgCmd: [
						sendBack(msgClient, {
							t: "guest.continue-as-guest-result",
							result: insertedSession,
						}),
					],
				};
			}

			return {
				model,
				msgCmd: [
					sendBack(msgClient, {
						t: "guest.continue-as-guest-result",
						result: Ok(newGuestAccount.userId),
					}),
				],
				msgEvt: [
					{
						t: "auth/client-authenticated",
						clientId: msgClient.clientId,
						account: newGuestAccount,
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
