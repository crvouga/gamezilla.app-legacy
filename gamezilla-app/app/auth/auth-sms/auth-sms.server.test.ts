import { describe, expect, it } from "bun:test";
import { Ok, PhoneNumber, Result } from "gamezilla-app/@/core";
import { ClientId, SessionId } from "gamezilla-app/app/@/data";
import { randomNormalUserAccount } from "gamezilla-app/app/@/data/account";
import { didSendMsgToClient } from "gamezilla-app/app/@/server";
import {
	AppServerFixture,
	randomClient,
} from "gamezilla-app/app/@/server/server-test-env";
import { AuthSMSTypes } from ".";
import { AccountDb } from "../@/server/account-db";
import { AuthSMSServer } from "./auth-sms.server";
import { VerificationId } from "./verify-sms/verification";
import { IVerifySMS } from "./verify-sms/verify-sms";
import { VerifySMS } from "./verify-sms/verify-sms-impl";

type InputMsg =
	| {
			msg: AuthSMSTypes.MsgServer;
	  }
	| {
			msgClient: AuthSMSTypes.MsgToServer & {
				clientId: ClientId;
				sessionId: SessionId;
			};
	  };

const Fixture = async (input?: { VerifySMS?: IVerifySMS }) => {
	const f = await AppServerFixture();
	const deps = {
		...(await AuthSMSServer.getDeps(f)),
		...input,
		AccountDb: AccountDb({
			t: "in-memory",
			delay: async () => {},
		}),
	};
	const updates = function* (msgs: InputMsg[]) {
		for (const msg of msgs) {
			yield AuthSMSServer.update({
				ctx: f.ctx,
				deps,
				model: null,
				...msg,
			});
		}
	};

	const update = (msgs: InputMsg[]) => {
		const upates = Array.from(updates(msgs));
		return upates[upates.length - 1]!;
	};

	const client = randomClient();

	return {
		...f,
		...deps,
		client,
		update,
	};
};

describe(import.meta.file, () => {
	it("should send code when user clicks send code", async () => {
		const f = await Fixture();
		const updated = await f.update([
			{
				msgClient: {
					...f.client,
					perferredLanguage: "en",
					t: "user-clicked-send-code-button",
					phoneNumber: PhoneNumber.random(),
				},
			},
		]);
		expect(didSendMsgToClient(updated, (msg) => msg.t === "sent-code")).toBe(
			true,
		);
	});

	it("should verify code when user clicks verify code", async () => {
		const f = await Fixture();
		const updated = await f.update([
			{
				msgClient: {
					...f.client,
					t: "user-clicked-verify-code-button",
					verificationId: VerificationId.generate(),
					inputtedCode: "123456",
				},
			},
		]);
		expect(
			didSendMsgToClient(updated, (msg) => msg.t === "verified-code"),
		).toBe(true);
	});

	it("should output event after successful verification", async () => {
		const f = await Fixture({ VerifySMS: VerifySMS({ t: "fake-always-ok" }) });

		const updated = await f.update([
			{
				msgClient: {
					...f.client,
					t: "user-clicked-verify-code-button",
					inputtedCode: "123",
					verificationId: VerificationId.generate(),
				},
			},
		]);

		expect(
			updated.msgEvt?.some(
				(msgEvt) => msgEvt.t === "auth/client-authenticated",
			),
		).toBe(true);
	});

	it("should create a new account if no account exists", async () => {
		const phoneNumber = PhoneNumber.random();
		const f = await Fixture({
			VerifySMS: VerifySMS({ t: "fake-always-ok", phoneNumber }),
		});

		const before = Result.unwrap(
			await f.AccountDb.findOneByPhoneNumber({ phoneNumber }),
		);

		await f.update([
			{
				msgClient: {
					...f.client,
					t: "user-clicked-verify-code-button",
					inputtedCode: "123",
					verificationId: VerificationId.generate(),
				},
			},
		]);

		const after = Result.unwrap(
			await f.AccountDb.findOneByPhoneNumber({ phoneNumber }),
		);

		expect(before).toBe(null);
		expect(after?.phoneNumber).toBe(phoneNumber);
	});

	it("should not create account if it already exists", async () => {
		const account = randomNormalUserAccount();

		const f = await Fixture({
			VerifySMS: VerifySMS({
				t: "fake-always-ok",
				phoneNumber: account.phoneNumber,
			}),
		});

		await f.AccountDb.insert({ account });

		await f.update([
			{
				msgClient: {
					...f.client,
					t: "user-clicked-verify-code-button",
					inputtedCode: "123",
					verificationId: VerificationId.generate(),
				},
			},
		]);

		const after = await f.AccountDb.findOneByPhoneNumber(account);
		expect(after).toEqual(Ok(account));
	});
});
