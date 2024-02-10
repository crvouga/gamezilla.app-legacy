import { describe, expect, test } from "bun:test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { eq } from "gamezilla/@SHARED/core"
import {
  clickedStartSpaceButton,
  makeSpace,
  init,
  serverConnected,
  gotSpace,
  userEndedSpace,
  userJoinedSpace,
  userStartedSpace,
  ctx,
  gotCurrentUsersSpace,
} from "../@TEST/client"
import { Spaces } from "../spaces-core"

const hasExcatlyOne = <T>(
  items: T[],
  predicate: (item: T) => boolean,
): boolean => {
  return items.filter(predicate).length === 1
}

describe("sync client", () => {
  test("should merge space recieved from server", async () => {
    const someStartedSpace = makeSpace(SpaceId.generate(), UserId.generate())

    const updated = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => gotSpace(model, someStartedSpace),
    )

    expect(
      Spaces.listSpaces({
        model: updated.model,
        offset: 0,
        limit: Infinity,
      }).some((space) => eq(space, someStartedSpace)),
    ).toBeTrue()
  })

  test("should merge current user's space when recieved from server", async () => {
    const spaceId = SpaceId.generate()

    const someStartedSpace = makeSpace(spaceId, ctx.currentUserId)

    const updated = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => gotCurrentUsersSpace(model, someStartedSpace),
    )

    expect(
      Spaces.toSpaceIdByUserId(updated.model, ctx.currentUserId) === spaceId,
    ).toBeTrue()
  })

  test("should sync current user's space when server connects if in space", async () => {
    const output = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => clickedStartSpaceButton(model, SpaceId.generate()),
      serverConnected,
    )
    expect(
      hasExcatlyOne(
        output.msgCmd ?? [],
        (msgCmd) =>
          msgCmd.t === "wire" &&
          msgCmd.c.t === "send-to-server" &&
          msgCmd.c.msg?.t === "sync",
      ),
    ).toBeTrue()
  })

  test("sends event to server like user started space", async () => {
    const output = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => {
        return userStartedSpace(model, UserId.generate(), SpaceId.generate())
      },
    )

    expect(
      hasExcatlyOne(
        output?.msgCmd ?? [],
        (msgCmd) =>
          msgCmd.t === "wire" &&
          msgCmd.c.t === "send-to-server" &&
          msgCmd.c.msg?.t === "event" &&
          msgCmd.c.msg?.c.t === "user-started-space",
      ),
    ).toBeTrue()
  })

  test("sends event to server like user joined space", async () => {
    const output = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => userJoinedSpace(model, UserId.generate(), SpaceId.generate()),
    )

    expect(
      hasExcatlyOne(
        output?.msgCmd ?? [],
        (msgCmd) =>
          msgCmd.t === "wire" &&
          msgCmd.c.t === "send-to-server" &&
          msgCmd.c.msg?.t === "event" &&
          msgCmd.c.msg?.c.t === "user-joined-space",
      ),
    ).toBeTrue()
  })

  test("sends event to server like user ended space", async () => {
    const output = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => userEndedSpace(model, UserId.generate(), SpaceId.generate()),
    )

    expect(
      hasExcatlyOne(
        output.msgCmd ?? [],
        (msgCmd) =>
          msgCmd.t === "wire" &&
          msgCmd.c.t === "send-to-server" &&
          msgCmd.c.msg?.t === "event" &&
          msgCmd.c.msg?.c.t === "user-ended-space",
      ),
    ).toBeTrue()
  })
})
