import { describe, expect, it } from "bun:test";
import { andThen } from "gamezilla-app/app/@shared/architecture/app-client";
import { didShowErrorSm, didShowToast } from "gamezilla-app/app/@shared/client";
import { SpaceId, UserId } from "gamezilla-app/app/@shared/data";
import {
	clickedJoinSpaceButton,
	clickedLeaveSpaceButton,
	Ctx,
	createFixture,
	init,
	userJoinedSpace,
	userStartedSpace,
} from "../@shared/testing/client";
import { Spaces } from "../spaces-core";

describe(import.meta.file, () => {
	it("should show some toast after joining space", async () => {
		const ctx = Ctx();
		const spaceId = SpaceId.generate();

		const output = andThen(
			init(ctx),
			userStartedSpace(ctx, UserId.generate(), spaceId),
			clickedJoinSpaceButton(ctx, spaceId),
		);

		expect(
			didShowToast(output, (toast) =>
				toast.message.toLowerCase().includes("join"),
			),
		).toBe(true);
	});

	it("should should toast of other user leaving space", async () => {
		const f = await createFixture();
		const spaceId = SpaceId.generate();

		const started = andThen(
			f.initial,
			userStartedSpace(f.ctx, f.ctx.currentUserId, spaceId),
		);

		const output = andThen(
			{ model: started.model },
			userJoinedSpace(f.ctx, f.userA.userId, spaceId),
		);

		expect(didShowToast(output)).toBe(true);
	});

	it("should join space when clicking join space button", async () => {
		const ctx = Ctx();
		const spaceId = SpaceId.generate();

		const joined = andThen(
			init(ctx),
			userStartedSpace(ctx, UserId.generate(), spaceId),
			clickedJoinSpaceButton(ctx, spaceId),
		);

		expect(Spaces.toSpaceIdByUserId(joined.model, ctx.currentUserId)).toEqual(
			spaceId,
		);
	});

	it("current user leaving joined space", async () => {
		const ctx = Ctx();
		const spaceId = SpaceId.generate();

		const left = andThen(
			init(ctx),
			userStartedSpace(ctx, UserId.generate(), spaceId),
			clickedJoinSpaceButton(ctx, spaceId),
			clickedLeaveSpaceButton(ctx),
		);

		expect(Spaces.toSpaceIdByUserId(left.model, ctx.currentUserId)).toEqual(
			null,
		);
		//
	});

	it("preventing joining a space if already in a space", async () => {
		const ctx = Ctx();
		const SpaceA = SpaceId.generate();
		const SpaceB = SpaceId.generate();

		const arranged = andThen(
			init(ctx),
			userStartedSpace(ctx, UserId.generate(), SpaceA),
			clickedJoinSpaceButton(ctx, SpaceA),
		);

		const joined = andThen(
			{ model: arranged.model },
			userStartedSpace(ctx, UserId.generate(), SpaceB),
			clickedJoinSpaceButton(ctx, SpaceB),
		);

		expect(Spaces.toSpaceIdByUserId(arranged.model, ctx.currentUserId)).toEqual(
			SpaceA,
		);

		expect(didShowErrorSm(joined)).toBe(true);
	});
});
