import { describe, expect, it } from "bun:test";
import { andThen } from "gamezilla-app/app/@/architecture/app-client";
import { addProfiles } from "gamezilla-app/app/@/client";
import {
	type Profile,
	SpaceId,
	UserId,
	Username,
} from "gamezilla-app/app/@/data";
import { eq } from "gamezilla-app/@/core";
import {
	Ctx,
	clickedJoinSpaceButton,
	clickedStartSpaceButton,
	gotCurrentUsersSpace,
	gotMsgServer,
	gotSpace,
	init,
	serverConnected,
	userEndedSpace,
	userStartedSpace,
} from "../@/testing/client";
import { makeSpace } from "../@/testing/shared";
import { SpaceCore, SpacesCoreClient } from "../spaces-core";

const hasExcatlyOne = <T>(
	items: T[],
	predicate: (item: T) => boolean,
): boolean => {
	return items.filter(predicate).length === 1;
};

describe(import.meta.file, () => {
	it("should record profiles when recieved from server", async () => {
		const someProfile: Profile = {
			userId: UserId.generate(),
			avatarUrl: "some url",
			username: await Username.generate(),
		};

		const someProfiles: { [userId: UserId]: Profile } = {
			[someProfile.userId]: someProfile,
		};

		const ctx = Ctx();

		const updated = andThen(
			init(ctx),
			//
			gotMsgServer(ctx, {
				t: "listed-spaces",
				spaces: [],
				profiles: someProfiles,
			}),
		);

		expect(
			hasExcatlyOne(updated.msgCmd ?? [], (msgCmd) =>
				eq(msgCmd, addProfiles(someProfiles)),
			),
		).toBe(true);
	});

	it("should merge space recieved from server", () => {
		const someSpace = makeSpace({
			spaceId: SpaceId.generate(),
			hostId: UserId.generate(),
		});
		const ctx = Ctx();

		const output = andThen(init(ctx), gotSpace(ctx, someSpace));

		const listed = SpacesCoreClient.listSpaces({
			model: output.model,
			offset: 0,
			limit: Number.POSITIVE_INFINITY,
		});

		expect(listed.some((space) => SpaceCore.isEqual(space, someSpace))).toBe(
			true,
		);
	});

	it("should merge current user's space when recieved from server", () => {
		const ctx = Ctx();
		const spaceId = SpaceId.generate();

		const someStartedSpace = makeSpace({ spaceId, hostId: ctx.currentUserId });

		const updated = andThen(
			init(ctx),
			gotCurrentUsersSpace(ctx, someStartedSpace),
		);

		expect(
			SpacesCoreClient.toSpaceIdByUserId(updated.model, ctx.currentUserId) ===
				spaceId,
		).toBe(true);
	});

	it("should sync current user's space when server connects if in space", () => {
		const ctx = Ctx();
		const output = andThen(
			init(ctx),
			clickedStartSpaceButton(ctx, SpaceId.generate()),
			serverConnected(ctx),
		);
		expect(
			hasExcatlyOne(
				output.msgCmd ?? [],
				(msgCmd) =>
					msgCmd.t === "wire" &&
					msgCmd.c.t === "send-to-server" &&
					msgCmd.c.msg?.t === "sync",
			),
		).toBe(true);
	});

	it("should send events to the server like user joined space", () => {
		const spaceId = SpaceId.generate();
		const ctx = Ctx();
		const output = andThen(
			init(ctx),
			//
			userStartedSpace(ctx, UserId.generate(), spaceId),
			clickedJoinSpaceButton(ctx, spaceId),
		);

		expect(
			hasExcatlyOne(
				output?.msgCmd ?? [],
				(msgCmd) =>
					msgCmd.t === "wire" &&
					msgCmd.c.t === "send-to-server" &&
					msgCmd.c.msg?.t === "event" &&
					msgCmd.c.msg?.c.t === "user-joined-space",
			),
		).toBe(true);
	});

	it("should send events to the server like user ended space", () => {
		const ctx = Ctx();
		const output = andThen(
			init(ctx),
			userEndedSpace(ctx, UserId.generate(), SpaceId.generate()),
		);

		expect(
			hasExcatlyOne(
				output.msgCmd ?? [],
				(msgCmd) =>
					msgCmd.t === "wire" &&
					msgCmd.c.t === "send-to-server" &&
					msgCmd.c.msg?.t === "event" &&
					msgCmd.c.msg?.c.t === "user-ended-space",
			),
		).toBe(true);
	});
});
