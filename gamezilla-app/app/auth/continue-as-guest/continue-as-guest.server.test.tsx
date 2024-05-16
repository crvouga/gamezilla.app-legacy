import { describe, expect, it } from "bun:test";
import { ClientId, SessionId } from "gamezilla-app/app/@/data";
import { AppServerFixture } from "gamezilla-app/app/@/server/server-test-env";
import { AccountDb } from "../@/server/account-db";
import { SessionDb } from "../@/server/session-db";
import * as AuthServer from "../auth.server";
import type { ServerDeps } from "../auth.types";
import { ContinueAsGuestServer } from "./continue-as-guest.server";
import * as ContinueAsGuestTypes from "./continue-as-guest.types";

type Msg =
	| {
			msgClient: ContinueAsGuestTypes.MsgToServer & {
				clientId: ClientId;
				sessionId: SessionId;
			};
	  }
	| {
			msg: ContinueAsGuestTypes.MsgServer;
	  };

export const Fixture = async () => {
	const f = await AppServerFixture();

	const accountDb = AccountDb({
		t: "in-memory",
		delay: async () => {},
	});
	const sessionDb = SessionDb({
		t: "in-memory",
		delay: async () => {},
	});

	const updates = async (msgs: Msg[]) => {
		const updates: Awaited<ReturnType<typeof ContinueAsGuestServer.update>>[] =
			[];
		for (const msg of msgs) {
			const update = await ContinueAsGuestServer.update({
				...msg,
				model:
					updates[updates.length - 1]?.model ?? ContinueAsGuestServer.initModel,
				ctx: f.ctx,
				deps: {
					accountDb: accountDb,
					sessionDb: sessionDb,
					timeout: () => new Promise((resolve) => resolve()),
				},
			});
			updates.push(update);
		}
		return updates;
	};

	const update = async (msgs: Msg[]) => {
		const updates_ = await updates(msgs);

		const update_ = updates_[updates_.length - 1];

		if (!update_) {
			throw new Error("No updates");
		}

		return update_;
	};

	const deps: ServerDeps = {
		accountDb,
		sessionDb,
		timeout: () => new Promise((resolve) => resolve()),
	};

	return {
		...f,
		deps,
		updates,
		update,
	};
};

describe(import.meta.file, () => {
	it("should be able to handle request", async () => {
		const f = await Fixture();

		const clientId = ClientId.generate();

		const output = await f.update([
			{
				msgClient: {
					t: "guest.clicked-continue-as-guest-button",
					clientId,
					sessionId: SessionId.generate(),
				},
			},
		]);
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
		const f = await Fixture();

		const clientId = ClientId.generate();
		const sessionId = SessionId.generate();

		const output = await f.update([
			{
				msgClient: {
					t: "guest.clicked-continue-as-guest-button",
					clientId,
					sessionId,
				},
			},
		]);

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
		const f = await Fixture();

		const clientId = ClientId.generate();
		const sessionId = SessionId.generate();

		await f.update([
			{
				msgClient: {
					t: "guest.clicked-continue-as-guest-button",
					clientId,
					sessionId,
				},
			},
		]);

		const userId = await AuthServer.toUserIdFromSessionId(f.deps, sessionId);

		expect(userId !== null).toBe(true);
	});

	it.todo(
		"should always use the same guest account for the same session id",
		async () => {
			const f = await Fixture();
			const sessionId = SessionId.generate();

			await f.update([
				{
					msgClient: {
						t: "guest.clicked-continue-as-guest-button",
						clientId: ClientId.generate(),
						sessionId,
					},
				},
			]);

			await f.update([
				{
					msgClient: {
						t: "guest.clicked-continue-as-guest-button",
						clientId: ClientId.generate(),
						sessionId,
					},
				},
			]);

			const userId = await AuthServer.toUserIdFromSessionId(f.deps, sessionId);

			expect(userId !== null).toBe(true);
		},
	);
});
