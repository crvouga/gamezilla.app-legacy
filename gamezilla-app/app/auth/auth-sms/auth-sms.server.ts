import {
	Err,
	Ok,
	Posix,
	Sub,
	TimeSpan,
	isErr,
	type Task,
} from "gamezilla-app/@/core";
import { Hashing } from "gamezilla-app/@/hashing";
import { AppServerModule } from "gamezilla-app/app/@/architecture/app-server";
import { Translator } from "gamezilla-app/app/@/client/translator";
import { UserId } from "gamezilla-app/app/@/data";
import type { UserAccount } from "gamezilla-app/app/@/data/account";
import {
	sendToClient,
	type ServerCmd,
	type ServerCtx,
	type ServerEvent,
} from "gamezilla-app/app/@/server";
import { ILogger } from "gamezilla-app/app/@/server/logger";
import { SMS } from "gamezilla-app/app/@/server/sms";
import type { IAccountDb } from "../@/server/account-db";
import { AccountDb } from "../@/server/account-db/account-db-impl";
import type { MsgServer, MsgToClient, MsgToServer } from "./auth-sms.types";
import type { VerificationId } from "./verify-sms/verification";
import { VerificationAttemptDb } from "./verify-sms/verification-attempt";
import { VerificationCodeGenerator } from "./verify-sms/verification-code-generator";
import { VerificationDb } from "./verify-sms/verification/verification-db";
import {
	verifyCodeProblemToString,
	type IVerifySMS,
	type VerifyCodeProblem,
} from "./verify-sms/verify-sms";
import { VerifySMS } from "./verify-sms/verify-sms-impl/verify-sms-impl";
import { VerifySMSProvider } from "./verify-sms/verify-sms-impl/verify-sms-impl-real/verify-sms-provider";

//
//
//
//
//
//

type Module = AppServerModule<{
	Ctx: ServerCtx;
	MsgEvtIn: ServerEvent;
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

const getDeps: Module["getDeps"] = async ({ ctx }) => {
	const verificationDb = VerificationDb({
		t: "postgres",
		dbConnSql: ctx.dbConnSql,
	});

	const verificationAttemptDb = VerificationAttemptDb({
		t: "postgres",
		dbConnSql: ctx.dbConnSql,
	});

	const hashing = Hashing({ t: "bun" });

	const providerInHouse = VerifySMSProvider({
		t: "in-house",
		hashing,
		logger: ctx.logger,
		now: Posix.now,
		sms: SMS({
			t: 'fake',
			logger: ILogger.prefix("sms", ctx.logger),
		}),
		Translator,
		verificationCodeGenerator: VerificationCodeGenerator({
			t: "fake",
			code: "123",
		}),
		verificationDb,
	});

	const providerTwilio = VerifySMSProvider({
		t: "twilio",
		logger: ILogger.prefix("twilio-verify", ctx.logger),
	});

	const provider = ctx.env === "prod" ? providerTwilio : providerInHouse;

	return {
		AccountDb: AccountDb({
			t: "postgres",
			dbConnSql: ctx.dbConnSql,
		}),
		VerifySMS: VerifySMS({
			t: "real",
			logger: ctx.logger,
			hashing,
			now: Posix.now,
			sendCodeDailyLimit: 1000,
			sendCodeHourlyLimit: 100,
			verificationAttemptDb,
			verificationDb,
			verifyCodeExpiresIn: TimeSpan.minutes(5),
			verifyCodeMaxAttempts: 3,
			provider,
		}),
	};
};

//
//
//
//
//
//

const init: Module["init"] = async () => {
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

const update: Module["update"] = async (input) => {
	return AppServerModule.andThen(
		{ model: input.model },
		(model) => updateSendCode({ ...input, model }),
		(model) => updateVerifyCode({ ...input, model }),
	);
};

const updateSendCode: Module["update"] = async ({ msgClient, model, deps }) => {
	switch (msgClient?.t) {
		case "user-clicked-send-code-button": {
			const sent = await deps.VerifySMS.sendCode(msgClient);
			return {
				model,
				msgCmd: [
					sendToClient([msgClient.clientId], {
						t: "sent-code",
						phoneNumber: msgClient.phoneNumber,
						sent,
					}),
				],
			};
		}
		default: {
			return { model };
		}
	}
};

const handleVerifyCode = async (input: {
	now: Posix;
	verificationId: VerificationId;
	inputtedCode: string;
	AccountDb: IAccountDb;
	VerifySMS: IVerifySMS;
}): Task<VerifyCodeProblem, UserAccount> => {
	const verified = await input.VerifySMS.verifyCode({
		code: input.inputtedCode,
		verificationId: input.verificationId,
	});

	if (isErr(verified)) {
		return verified;
	}

	const found = await input.AccountDb.findOneByPhoneNumber(verified.value);

	if (isErr(found)) {
		return Err({
			t: "database-error",
			error: found.error,
		});
	}

	const accountFound = found.value;

	if (accountFound) {
		return Ok(accountFound);
	}

	const accountNew: UserAccount = {
		createdAt: input.now,
		phoneNumber: verified.value.phoneNumber,
		role: "normal",
		userId: UserId.generate(),
	};

	const inserted = await input.AccountDb.insert({
		account: accountNew,
	});

	if (isErr(inserted)) {
		return Err({
			t: "database-error",
			error: inserted.error,
		});
	}

	return Ok(accountNew);
};

const updateVerifyCode: Module["update"] = async ({
	msgClient,
	model,
	deps,
	ctx,
}) => {
	switch (msgClient?.t) {
		case "user-clicked-verify-code-button": {
			ctx.logger.info(`Verifying code for ${msgClient.verificationId}`);
			const verified = await handleVerifyCode({
				AccountDb: deps.AccountDb,
				VerifySMS: deps.VerifySMS,
				now: ctx.now,
				verificationId: msgClient.verificationId,
				inputtedCode: msgClient.inputtedCode,
			});
			ctx.logger.info(`Verified code for ${msgClient.verificationId}`);

			if (isErr(verified)) {
				ctx.logger.error(
					`Failed to verify code. ${verifyCodeProblemToString({
						problem: verified.error,
						t: Translator("en"),
					})}`,
				);
				return {
					model,
					msgCmd: [sendToClient(msgClient, { t: "verified-code", verified })],
				};
			}

			return {
				model,
				msgCmd: [sendToClient(msgClient, { t: "verified-code", verified })],
				msgEvt: [
					{
						...msgClient,
						t: "auth/client-authenticated",
						account: verified.value,
						loggedIn: true,
					},
				],
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

const subscriptions: Module["subscriptions"] = async () => {
	return Sub.None;
};

//
//
//
//
//
//
//

export const AuthSMSServer = {
	getDeps,
	init,
	update,
	subscriptions,
};
