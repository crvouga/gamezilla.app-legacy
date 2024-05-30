import { describe, expect, it } from "bun:test";
import { ClientId, SessionId } from "gamezilla-app/app/@/data";
import {
	AppServerFixture,
	AppServerTestEnv,
} from "gamezilla-app/app/@/server/server-test-env";
import { UserAccountDb } from "../@/server/user-account-db";
import { UserSessionDb } from "../@/server/user-session-db";
import * as AuthServer from "../auth.server";
import type { ServerDeps } from "../auth.types";
import { ContinueAsGuestServer } from "./continue-as-guest.server";
import type * as ContinueAsGuestTypes from "./continue-as-guest.types";
import { GuestSessionMappingDb } from "./guest-session-mapping-db";
import { didSendMsgToClient } from "gamezilla-app/app/@/server";
import { isOk } from "gamezilla-app/@/core";

type Input =
	| {
			msgClient: ContinueAsGuestTypes.MsgToServer & {
				clientId: ClientId;
				sessionId: SessionId;
			};
	  }
	| {
			msg: ContinueAsGuestTypes.MsgServer;
	  };

const FixtureDeps = async (): Promise<ServerDeps> => {
	const testEnv = await AppServerTestEnv();
	const timeout = () => new Promise((resolve) => resolve(null));

	switch (testEnv.t) {
		case "integration": {
			const accountDb = UserAccountDb({
				t: "postgres",
				dbConnSql: testEnv.dbConnSql,
			});
			const sessionDb = UserSessionDb({
				t: "postgres-with-db-kv-cache",
				dbConnSql: testEnv.dbConnSql,
				dbConnKv: testEnv.dbConnKv,
			});
			const guestSessionMappingDb = GuestSessionMappingDb({
				t: "postgres",
				dbConnSql: testEnv.dbConnSql,
			});
			return {
				timeout,
				userAccountDb: accountDb,
				userSessionDb: sessionDb,
				guestSessionMappingDb,
			};
		}
		case "unit": {
			const accountDb = UserAccountDb({
				t: "in-memory",
				delay: async () => {},
			});
			const sessionDb = UserSessionDb({
				t: "in-memory",
				delay: async () => {},
			});
			const guestSessionMappingDb = GuestSessionMappingDb({
				t: "hash-map",
			});
			return {
				timeout,
				userAccountDb: accountDb,
				userSessionDb: sessionDb,
				guestSessionMappingDb,
			};
		}
	}
};

const Fixture = async () => {
	const f = await AppServerFixture();
	const deps = await FixtureDeps();

	const updates = async (msgs: Input[]) => {
		const updates: Awaited<ReturnType<typeof ContinueAsGuestServer.update>>[] =
			[];
		for (const msg of msgs) {
			const update = await ContinueAsGuestServer.update({
				...msg,
				model:
					updates[updates.length - 1]?.model ?? ContinueAsGuestServer.initModel,
				ctx: f.ctx,
				deps,
			});
			updates.push(update);
		}
		return updates;
	};

	const update = async (msgs: Input[]) => {
		const updates_ = await updates(msgs);

		const update_ = updates_[updates_.length - 1];

		if (!update_) {
			throw new Error("No updates");
		}

		return update_;
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

	it("should always use the same guest account for the same session id", async () => {
		const f = await Fixture();
		const sessionId = SessionId.generate();
		const clientId = ClientId.generate();

		const before = await AuthServer.toUserIdFromSessionId(f.deps, sessionId);

		await f.update([
			{
				msgClient: {
					t: "guest.clicked-continue-as-guest-button",
					clientId,
					sessionId,
				},
			},
		]);

		const afterFirst = await AuthServer.toUserIdFromSessionId(
			f.deps,
			sessionId,
		);

		await f.update([
			{
				msgClient: {
					t: "guest.clicked-continue-as-guest-button",
					clientId,
					sessionId,
				},
			},
		]);

		const afterSecond = await AuthServer.toUserIdFromSessionId(
			f.deps,
			sessionId,
		);

		await f.update([
			{
				msgClient: {
					t: "guest.clicked-continue-as-guest-button",
					clientId,
					sessionId,
				},
			},
		]);

		const afterThird = await AuthServer.toUserIdFromSessionId(
			f.deps,
			sessionId,
		);

		expect(before).toEqual(null);
		expect(afterFirst).toEqual(afterSecond);
		expect(afterSecond).toEqual(afterThird);
	});

	it("should send back ok result after continuing as a guest multiple times", async () => {
		const f = await Fixture();
		const sessionId = SessionId.generate();
		const clientId = ClientId.generate();

		const firstOutput = await f.update([
			{
				msgClient: {
					t: "guest.clicked-continue-as-guest-button",
					clientId,
					sessionId,
				},
			},
		]);

		const secondOutput = await f.update([
			{
				msgClient: {
					t: "guest.clicked-continue-as-guest-button",
					clientId,
					sessionId,
				},
			},
		]);

		expect(
			didSendMsgToClient(
				firstOutput,
				(msg) => msg.t === "guest.continue-as-guest-result" && isOk(msg.result),
			),
		).toBe(true);
		expect(
			didSendMsgToClient(
				secondOutput,
				(msg) => msg.t === "guest.continue-as-guest-result" && isOk(msg.result),
			),
		).toBe(true);
	});

	it("should output the same account everytime", async () => {
		const f = await Fixture();
		const sessionId = SessionId.generate();
		const clientId = ClientId.generate();

		const firstOutput = await f.update([
			{
				msgClient: {
					t: "guest.clicked-continue-as-guest-button",
					clientId,
					sessionId,
				},
			},
		]);

		const secondOutput = await f.update([
			{
				msgClient: {
					t: "guest.clicked-continue-as-guest-button",
					clientId,
					sessionId,
				},
			},
		]);

		const expectedUserId = await AuthServer.toUserIdFromSessionId(
			f.deps,
			sessionId,
		);

		expect(
			didSendMsgToClient(
				firstOutput,
				(msg) =>
					msg.t === "guest.continue-as-guest-result" &&
					isOk(msg.result) &&
					msg.result.value === expectedUserId,
			),
		).toBe(true);
		expect(
			didSendMsgToClient(
				secondOutput,
				(msg) =>
					msg.t === "guest.continue-as-guest-result" &&
					isOk(msg.result) &&
					msg.result.value === expectedUserId,
			),
		).toBe(true);
	});

	it("should output the same account everytime", async () => {
		const f = await Fixture();
		const sessionId = SessionId.generate();
		const clientId = ClientId.generate();

		const firstOutput = await f.update([
			{
				msgClient: {
					t: "guest.clicked-continue-as-guest-button",
					clientId,
					sessionId,
				},
			},
		]);

		const secondOutput = await f.update([
			{
				msgClient: {
					t: "guest.clicked-continue-as-guest-button",
					clientId,
					sessionId,
				},
			},
		]);

		const expectedUserId = await AuthServer.toUserIdFromSessionId(
			f.deps,
			sessionId,
		);

		expect(
			firstOutput.msgEvt?.some(
				(msg) =>
					msg.t === "auth/client-authenticated" &&
					msg.account.userId === expectedUserId,
			),
		).toBe(true);
		expect(
			secondOutput.msgEvt?.some(
				(msg) =>
					msg.t === "auth/client-authenticated" &&
					msg.account.userId === expectedUserId,
			),
		).toBe(true);
	});
});
