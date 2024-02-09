import { expect, test } from "bun:test";
import { didShowErrorSm } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { AppClientModule } from "../../../../@SHARED/architecture/app-client";
import { Spaces } from "../../spaces-core";
import {
  ctx,
  init,
  userJoinedSpace,
  userLeftSpace,
  userStartedSpace,
} from "./shared";

test("current user starting space", async () => {
  const spaceId = SpaceId.generate();

  const started = await AppClientModule.chainUpdates(await init(), (model) =>
    userStartedSpace(model, ctx.currentUserId, spaceId)
  );

  expect(Spaces.toSpaceIdByUserId(started.model, ctx.currentUserId)).toEqual(
    spaceId
  );
});

test("redirecting when starting a space", async () => {
  const spaceId = SpaceId.generate();

  const initial = await init();

  const started = await userStartedSpace(
    initial.model,
    ctx.currentUserId,
    spaceId
  );

  expect(
    started.msgCmd?.filter(
      (msgCmd) =>
        msgCmd.t === "routing" &&
        msgCmd.c.t === "push" &&
        msgCmd.c.route.t === "spaces" &&
        msgCmd.c.route.c.t === "space" &&
        msgCmd.c.route.c.spaceId === spaceId
    )
  ).toHaveLength(1);
});
