import { describe, expect, test } from "bun:test";
import { AppClientModule } from "../../@SHARED/architecture/app-client";
import {
  init,
  userJoinedSpace,
  userStartedSpace,
  userEndedSpace,
} from "./@TEST/client";
import { SpaceId, UserId } from "../../@SHARED/data";

describe("space client", () => {
  test("sends event to server like user started space", async () => {
    const output = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => userStartedSpace(model, UserId.generate(), SpaceId.generate())
    );

    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === "wire" &&
          msgCmd.c.t === "send-to-server" &&
          msgCmd.c.msg?.t === "event" &&
          msgCmd.c.msg?.c.t === "user-started-space"
      )
    ).toBeTrue();
  });

  test("sends event to server like user joined space", async () => {
    const output = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => userJoinedSpace(model, UserId.generate(), SpaceId.generate())
    );

    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === "wire" &&
          msgCmd.c.t === "send-to-server" &&
          msgCmd.c.msg?.t === "event" &&
          msgCmd.c.msg?.c.t === "user-joined-space"
      )
    ).toBeTrue();
  });

  test("sends event to server like user ended space", async () => {
    const output = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => userEndedSpace(model, UserId.generate(), SpaceId.generate())
    );

    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === "wire" &&
          msgCmd.c.t === "send-to-server" &&
          msgCmd.c.msg?.t === "event" &&
          msgCmd.c.msg?.c.t === "user-ended-space"
      )
    ).toBeTrue();
  });
});
