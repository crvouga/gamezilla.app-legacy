import { describe, expect, it } from "bun:test";
import { AppClientModule } from "gamezilla-app/app/@/architecture/app-client";
import {
	APP_SOUND,
	type ClientCtx,
	didPlaySound,
	didPushRoute,
} from "gamezilla-app/app/@/client";
import { SpaceId } from "gamezilla-app/app/@/data";
import {
	RequestResponse,
	TimeSpan,
	isRequesting,
	isResponseOk,
} from "gamezilla-app/@/core";
import {
	changeRoute,
	clickSpaceCard,
	clickedGoHomeButton,
	Ctx,
	elapsed,
	init,
	serverListedSpaces,
} from "../@/testing/client";

const changeRouteToSpaceList = (ctx: ClientCtx) => {
	return changeRoute(ctx, { n: "spaces", t: "space-list" });
};

describe(import.meta.file, () => {
	it("should request spaces on init if on space list route", () => {
		const ctx = Ctx();
		const output = init({
			...ctx,
			currentRoute: { n: "spaces", t: "space-list" },
		});
		expect(
			isRequesting(output.model.listSpacesRequest) &&
				output.model.listSpacesRequest.requestedAt === ctx.now,
		).toBe(true);
	});

	it("should send list space request to server initially", () => {
		const ctx = Ctx();
		const output = init({
			...ctx,
			currentRoute: { n: "spaces", t: "space-list" },
		});
		expect(
			output.msgCmd?.some(
				(msgCmd) => msgCmd.t === "wire" && msgCmd.c.msg?.t === "list-spaces",
			),
		).toBe(true);
	});

	it("should request spaces on space list route change", () => {
		const ctx = Ctx();
		const updated = AppClientModule.andThen(
			init(ctx),
			changeRouteToSpaceList(ctx),
		);
		expect(updated.model.listSpacesRequest.t === "loading").toBe(true);
	});

	it("should timeout request", () => {
		const ctx = Ctx();
		const updated = AppClientModule.andThen(
			init(ctx),
			changeRouteToSpaceList(ctx),
			elapsed(ctx, TimeSpan.minutes(5)),
		);

		expect(
			RequestResponse.didRequestTimeout(updated.model.listSpacesRequest),
		).toBe(true);
	});

	it("should be ok when server responds with a list of spaces", () => {
		const ctx = Ctx();
		const updated = AppClientModule.andThen(
			init(ctx),
			changeRouteToSpaceList(ctx),
			serverListedSpaces(ctx),
		);
		expect(isResponseOk(updated.model.listSpacesRequest)).toBe(true);
	});

	it("should be ok when server responds with a list of spaces even when it timed out", () => {
		const ctx = Ctx();
		const updated = AppClientModule.andThen(
			init(ctx),
			changeRouteToSpaceList(ctx),
			elapsed(ctx, TimeSpan.seconds(10)),
			serverListedSpaces(ctx),
		);

		expect(isResponseOk(updated.model.listSpacesRequest)).toBe(true);
	});

	it("should navigate to space screen after clicking a space card", () => {
		const SpaceA = SpaceId.generate();
		const ctx = Ctx();
		const updated = AppClientModule.andThen(
			init(ctx),
			serverListedSpaces(ctx, [SpaceA]),
			clickSpaceCard(ctx, SpaceA),
		);

		expect(didPushRoute(updated)).toBe(true);
	});

	it("should make a nav forward sound when opening a space screen", () => {
		const SpaceA = SpaceId.generate();
		const ctx = Ctx();
		const updated = AppClientModule.andThen(
			init(ctx),
			serverListedSpaces(ctx, [SpaceA]),
			clickSpaceCard(ctx, SpaceA),
		);
		expect(didPlaySound(updated, APP_SOUND.navForwardMin)).toBe(true);
	});

	it("should make a sound when closing room screen", () => {
		const SpaceA = SpaceId.generate();
		const ctx = Ctx();
		const updated = AppClientModule.andThen(
			init(ctx),
			serverListedSpaces(ctx, [SpaceA]),
			clickSpaceCard(ctx, SpaceA),
			clickedGoHomeButton(ctx),
		);
		expect(didPlaySound(updated, APP_SOUND.navBackwardMin)).toBe(true);
	});
});
