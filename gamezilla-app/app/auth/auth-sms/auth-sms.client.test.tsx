import { describe, expect, it } from "bun:test";
import { Ok, PhoneNumber } from "gamezilla-app/@/core";
import { didPushRoute } from "gamezilla-app/app/@/client";
import { AppClientFixture } from "gamezilla-app/app/@/client/client-test-env";
import { AuthSMSTypes } from ".";
import { AuthSMSClient } from "./auth-sms.client";
import { VerificationId } from "./verify-sms/verification";

type Msg =
	| {
			msg: AuthSMSTypes.MsgClient;
	  }
	| {
			msgServer: AuthSMSTypes.MsgToClient;
	  };

const Fixture = async () => {
	const f = await AppClientFixture();

	const updates = (init: AuthSMSTypes.ModelClient, msgs: Msg[]) => {
		const updates: ReturnType<typeof AuthSMSClient.update>[] = [];
		let model = init;
		for (const msg of msgs) {
			const updated = AuthSMSClient.update({
				ctx: f.ctx,
				model,
				...msg,
			});
			model = updated.model;
			updates.push(updated);
		}
		return updates;
	};

	const update = (init: AuthSMSTypes.ModelClient, msgs: Msg[]) => {
		const updates_ = updates(init, msgs);
		return updates_[updates_.length - 1];
	};

	const init = AuthSMSClient.init({
		ctx: f.ctx,
		stored: null,
	}).model;

	return {
		...f,
		init,
		update,
	};
};

describe(import.meta.file, () => {
	it("should navigate to verify code screen after code is sent", async () => {
		const f = await Fixture();
		const verificationId = VerificationId.generate();

		const output = f.update(f.init, [
			{
				msgServer: {
					t: "sent-code",
					phoneNumber: PhoneNumber.random(),
					sent: Ok({
						verificationId,
					}),
				},
			},
		]);

		expect(
			didPushRoute(
				output,
				(msg) =>
					msg.n === "auth-login" &&
					msg.t === "login-sms-verify" &&
					msg.verificationId === verificationId,
			),
		).toBe(true);
	});
});
