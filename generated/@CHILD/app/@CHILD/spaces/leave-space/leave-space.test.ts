import { describe, expect, it } from "bun:test";
import { andThen } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client";
import { didPlaySound, didPushRoute, didShowToast, } from "gamezilla-app/@CHILD/app/@SHARED/client";
import { SpaceId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data";
import { clickedLeaveSpaceButton, createCtx, init, userJoinedSpace, userLeftSpace, userStartedSpace, } from "../@TEST/client";
import { Spaces } from "../spaces-core";
describe(import.meta.file, () => {
    it("should navigate to list screen after leaving space", async () => {
        const ctx = createCtx();
        const spaceId = SpaceId.generate();
        const joined = await andThen(init(ctx), userStartedSpace(ctx, UserId.generate(), spaceId), userJoinedSpace(ctx, ctx.currentUserId, spaceId));
        const output = await andThen({ model: joined.model }, userLeftSpace(ctx, ctx.currentUserId, spaceId));
        expect(didPushRoute(output, (x) => x.t === "space-list")).toBeTrue();
    });
    it("should only redirect to list screen for the user leaving the space", async () => {
        const ctx = createCtx();
        const spaceId = SpaceId.generate();
        const userId = UserId.generate();
        const joined = await andThen(init(ctx), userStartedSpace(ctx, ctx.currentUserId, spaceId), userJoinedSpace(ctx, userId, spaceId));
        const output = await andThen({ model: joined.model }, userLeftSpace(ctx, userId, spaceId));
        expect(didPushRoute(output)).toBeFalse();
    });
    it("should show some toast after leaving a space", async () => {
        const ctx = createCtx();
        const spaceId = SpaceId.generate();
        const joined = await andThen(init(ctx), userStartedSpace(ctx, UserId.generate(), spaceId), userJoinedSpace(ctx, ctx.currentUserId, spaceId));
        const output = await andThen({ model: joined.model }, userLeftSpace(ctx, ctx.currentUserId, spaceId));
        expect(didShowToast(output)).toBeTrue();
    });
    it("user is not in space after leaving", async () => {
        const ctx = createCtx();
        const spaceId = SpaceId.generate();
        const updated = await andThen(init(ctx), userStartedSpace(ctx, UserId.generate(), spaceId), userJoinedSpace(ctx, ctx.currentUserId, spaceId), clickedLeaveSpaceButton(ctx));
        expect(Spaces.toSpaceIdByUserId(updated.model, ctx.currentUserId)).toEqual(null);
    });
    it("should play sound after leaving", async () => {
        const ctx = createCtx();
        const spaceId = SpaceId.generate();
        const joined = await andThen(init(ctx), userStartedSpace(ctx, UserId.generate(), spaceId), userJoinedSpace(ctx, ctx.currentUserId, spaceId));
        const left = await andThen({ model: joined.model }, clickedLeaveSpaceButton(ctx));
        expect(didPlaySound(left)).toBeTrue();
    });
});
