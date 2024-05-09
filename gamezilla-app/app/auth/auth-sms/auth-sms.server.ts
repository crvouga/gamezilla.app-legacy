import {
	Sub,
	isErr
} from "gamezilla-app/@/core";
import { AppServerModule } from "gamezilla-app/app/@/architecture/app-server";
import {
	sendToClient,
	type ServerCmd,
	type ServerCtx,
	type ServerEvent,
} from "gamezilla-app/app/@/server";
import type { IAccountDb } from "../@/server/account-db";
import { AccountDb } from "../@/server/account-db/account-db-impl";
import type {
	AuthSMSServerEvent,
	MsgServer,
	MsgToClient,
	MsgToServer,
} from "./auth-sms.types";
import { type IVerifySMS } from "./verify-sms/verify-sms";
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
	MsgEvtOut: AuthSMSServerEvent;
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
	return {
		AccountDb: AccountDb({
			t: "postgres",
			dbConnSql: ctx.dbConnSql,
		}),
		VerifySMS: VerifySMS({
			t: "fake",
			logger: ctx.logger,
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

const updateVerifyCode: Module["update"] = async ({
	msgClient,
	model,
	deps,
}) => {
	switch (msgClient?.t) {
		case "user-clicked-verify-code-button": {
			const verified = await deps.VerifySMS.verifyCode({
				code: msgClient.inputtedCode,
				verificationId: msgClient.verificationId,
			});

			if (isErr(verified)) {
				return {
					model,
					msgCmd: [
						sendToClient([msgClient.clientId], {
							t: "verified-code",
							verified,
						}),
					],
				};
			}

			return {
				model,
				msgCmd: [
					sendToClient([msgClient.clientId], { t: "verified-code", verified }),
				],
				msgEvt: [
					{
						...msgClient,
						t: "auth-sms.user-authenticated-with-sms",
						phoneNumber: verified.value.phoneNumber,
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

export const AuthSMSServer = {
	getDeps,
	init,
	update,
	subscriptions,
};
