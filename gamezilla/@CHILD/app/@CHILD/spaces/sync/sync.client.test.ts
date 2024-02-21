import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { addProfiles } from "gamezilla/@CHILD/app/@SHARED/client"
import {
  Profile,
  SpaceId,
  UserId,
  Username,
} from "gamezilla/@CHILD/app/@SHARED/data"
import { eq } from "gamezilla/@SHARED/core"
import {
  clickedJoinSpaceButton,
  clickedStartSpaceButton,
  ctx,
  gotCurrentUsersSpace,
  gotMsgServer,
  gotSpace,
  init,
  serverConnected,
  userEndedSpace,
  userStartedSpace,
} from "../@TEST/client"
import { Space, Spaces } from "../spaces-core"
import { makeSpace } from "../@TEST/shared"

const hasExcatlyOne = <T>(
  items: T[],
  predicate: (item: T) => boolean,
): boolean => {
  return items.filter(predicate).length === 1
}

describe(import.meta.file, () => {
  it("should record profiles when recieved from server", async () => {
    const someProfile: Profile = {
      userId: UserId.generate(),
      avatarUrl: "some url",
      username: Username.generate(),
    }

    const someProfiles: { [userId: UserId]: Profile } = {
      [someProfile.userId]: someProfile,
    }

    const updated = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) =>
        gotMsgServer(model, {
          t: "listed-spaces",
          spaces: [],
          profiles: someProfiles,
        }),
    )

    expect(
      hasExcatlyOne(updated.msgCmd ?? [], (msgCmd) =>
        eq(msgCmd, addProfiles(someProfiles)),
      ),
    ).toBeTrue()
  })

  it("should merge space recieved from server", async () => {
    const someSpace = makeSpace(SpaceId.generate(), UserId.generate())

    const output = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => gotSpace(model, someSpace),
    )

    const listed = Spaces.listSpaces({
      model: output.model,
      offset: 0,
      limit: Infinity,
    })

    expect(listed.some((space) => Space.isEqual(space, someSpace))).toBeTrue()
  })

  it("should merge current user's space when recieved from server", async () => {
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

  it("should sync current user's space when server connects if in space", async () => {
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

  it("should send events to the server like user joined space", async () => {
    const spaceId = SpaceId.generate()
    const output = await AppClientModule.chainUpdates(
      await init(),
      //
      (model) => userStartedSpace(model, UserId.generate(), spaceId),
      (model) => clickedJoinSpaceButton(model, spaceId),
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

  it("should send events to the server like user ended space", async () => {
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
