import { AppServerModule } from "gamezilla-app/app/@/architecture/app-server";
import { UserId } from "gamezilla-app/app/@/data";
import type { UserAccount } from "gamezilla-app/app/@/data/account";
import {
	type ServerCmd,
	type ServerCtx,
	type ServerEvent,
	sendToClient,
} from "gamezilla-app/app/@/server";
import { Err, Ok, type Posix, Result, Sub, isErr } from "gamezilla-app/@/core";
import { type Hash, Hashing } from "gamezilla-app/@/hashing";
import type { IAccountDb } from "../@/server/account-db";
import { AccountDb } from "../@/server/account-db/account-db-impl";
import type { MsgServer, MsgToClient, MsgToServer } from "./auth-sms.types";
import type { IVerifySMS } from "./verify-sms/verify-sms";
import { VerifySMS } from "./verify-sms/verify-sms-impl";

//
//
//
//
//
//

type Module = AppServerModule<{
	Ctx: ServerCtx;
	MsgCmdIn: null;
	MsgEvtIn: ServerEvent;
	Model: null;
	Msg: MsgServer;
	MsgCmdOut: ServerCmd<MsgToClient>;
	MsgEvtOut: ServerEvent;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	Deps: {
		AccountDb: IAccountDb;
		VerifySMS: IVerifySMS;
	};
}>;

//
//
//
//
//
//

export const getDeps: Module["getDeps"] = async ({ ctx }) => {
	return {
		AccountDb: AccountDb({
			t: "postgres",
			dbConnSql: ctx.dbConnSql,
		}),
		VerifySMS: VerifySMS({
			t: "fake",
			delay: () => new Promise((resolve) => setTimeout(resolve, 1000)),
			logger: ctx.logger,
			hashing: Hashing({ t: "bun" }),
		}),
	};
};

//
//
//
//
//
//

export const init: Module["init"] = async () => {
	return {
		model: null,
	};
};

//
//
//
//
//
//
//

export const update: Module["update"] = async (input) => {
	return AppServerModule.andThen({ model: input.model }, (model) =>
		updateFromClient({ ...input, model }),
	);
};

export const updateFromClient: Module["update"] = async ({
	msgClient,
	model,
	deps,
	ctx,
}) => {
	if (!msgClient) {
		return { model };
	}

	switch (msgClient.t) {
		case "send-code": {
			const sent = await deps.VerifySMS.sendCode(msgClient);

			return {
				model,
				msgCmd: [
					sendToClient([msgClient.clientId], {
						t: "sent-code",
						phoneNumber: msgClient.phoneNumber,
						result: sent,
					}),
				],
			};
		}

		case "verify-code": {
			const verified = await deps.VerifySMS.verifyCode({
				code: msgClient.code,
				verificationId: msgClient.verificationId,
			});

			if (isErr(verified)) {
				return {
					model,
					msgCmd: [
						sendToClient([msgClient.clientId], {
							t: "verified-code",
							result: verified,
						}),
					],
				};
			}

			const found = await findElseInsertAccount({
				accountDb: deps.AccountDb,
				phoneNumberHash: verified.value.phoneNumberHash,
				now: ctx.now,
			});

			if (isErr(found)) {
				return {
					model,
					msgCmd: [
						sendToClient([msgClient.clientId], {
							t: "verified-code",
							result: Err({
								t: "database-error",
								error: found.error,
							}),
						}),
					],
				};
			}

			return {
				model,
				msgCmd: [
					sendToClient([msgClient.clientId], {
						t: "verified-code",
						result: Result.mapOk(verified, () => null),
					}),
				],
				msgEvt: [
					{
						t: "auth/client-authenticated",
						clientId: msgClient.clientId,
						sessionId: msgClient.sessionId,
						account: found.value,
						loggedIn: true,
					},
				],
			};
		}
	}
};

//
//
//
//
//
//

export const subscriptions: Module["subscriptions"] = async () => {
	return Sub.None;
};

//
//
//
//
//
//
//
//
//

const findElseInsertAccount = async ({
	accountDb,
	phoneNumberHash,
	now,
}: {
	accountDb: IAccountDb;
	phoneNumberHash: Hash;
	now: Posix;
}): Promise<Result<string, UserAccount>> => {
	const found = await accountDb.findOneByPhoneNumberHash({
		phoneNumberHash,
	});

	if (isErr(found)) {
		return found;
	}

	const maybeAccount = found.value;

	if (maybeAccount) {
		return Ok(maybeAccount);
	}

	const accountNew: UserAccount = {
		role: "normal",
		userId: UserId.generate(),
		createdAt: now,
	};

	const inserted = await accountDb.insert({
		account: accountNew,
		phoneNumberHash,
	});

	if (isErr(inserted)) {
		return inserted;
	}

	return Ok(accountNew);
};
