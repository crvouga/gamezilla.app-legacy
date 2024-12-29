import { describe, expect, it } from 'bun:test'
import { eq } from '~/@/equals/equals'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { addProfiles } from '~/app/@/client'
import { type Profile, SpaceId, UserId, Username } from '~/app/@/data'
import {
  clickedJoinSpaceButton,
  clickedStartSpaceButton,
  Ctx,
  gotCurrentUsersSpace,
  gotMsgServer,
  gotSpace,
  init,
  serverConnected,
  userEndedSpace,
  userStartedSpace
} from '../@/fixture/client'
import { makeSpace } from '../@/fixture/shared'
import { SpaceCore } from '../core'
import * as SpacesCoreClient from '../core/client/spaces-core.client'

const hasExactlyOne = <T>(items: T[], predicate: (item: T) => boolean): boolean => {
  return items.filter(predicate).length === 1
}

describe(import.meta.file, () => {
  it('should record profiles when received from server', async () => {
    const someProfile: Profile = {
      userId: UserId.generate(),
      avatarUrl: 'some url',
      username: await Username.generate()
    }

    const someProfiles: {
      [userId: UserId]: Profile
    } = {
      [someProfile.userId]: someProfile
    }

    const ctx = Ctx()

    const updated = AppClientModule.andThen(
      init(ctx),
      //
      gotMsgServer(ctx, {
        t: 'listed-spaces',
        spaces: [],
        profiles: someProfiles
      })
    )

    expect(hasExactlyOne(updated.msgCmd ?? [], (msgCmd) => eq(msgCmd, addProfiles(someProfiles)))).toBe(true)
  })

  it('should merge space recieved from server', () => {
    const someSpace = makeSpace({
      spaceId: SpaceId.generate(),
      hostId: UserId.generate()
    })
    const ctx = Ctx()

    const output = AppClientModule.andThen(init(ctx), gotSpace(ctx, someSpace))

    const listed = SpacesCoreClient.listSpaces({
      model: output.model,
      offset: 0,
      limit: Number.POSITIVE_INFINITY
    })

    expect(listed.some((space) => SpaceCore.isEqual(space, someSpace))).toBe(true)
  })

  it("should merge current user's space when recieved from server", () => {
    const ctx = Ctx()
    const spaceId = SpaceId.generate()

    const someStartedSpace = makeSpace({
      spaceId,
      hostId: ctx.currentUserId
    })

    const updated = AppClientModule.andThen(init(ctx), gotCurrentUsersSpace(ctx, someStartedSpace))

    expect(SpacesCoreClient.toSpaceIdByUserId(updated.model, ctx.currentUserId) === spaceId).toBe(true)
  })

  it("should sync current user's space when server connects if in space", () => {
    const ctx = Ctx()
    const output = AppClientModule.andThen(
      init(ctx),
      clickedStartSpaceButton(ctx, SpaceId.generate()),
      serverConnected(ctx)
    )
    expect(
      hasExactlyOne(
        output.msgCmd ?? [],
        (msgCmd) => msgCmd.t === 'wire' && msgCmd.c.t === 'send-to-server' && msgCmd.c.toServer?.t === 'sync'
      )
    ).toBe(true)
  })

  it('should send events to the server like user joined space', () => {
    const spaceId = SpaceId.generate()
    const ctx = Ctx()
    const output = AppClientModule.andThen(
      init(ctx),
      //
      userStartedSpace(ctx, UserId.generate(), spaceId),
      clickedJoinSpaceButton(ctx, spaceId)
    )

    expect(
      hasExactlyOne(
        output?.msgCmd ?? [],
        (msgCmd) =>
          msgCmd.t === 'wire' &&
          msgCmd.c.t === 'send-to-server' &&
          msgCmd.c.toServer?.t === 'got-msg-core' &&
          msgCmd.c.toServer?.c.t === 'user-joined-space'
      )
    ).toBe(true)
  })

  it('should send events to the server like user ended space', () => {
    const ctx = Ctx()
    const output = AppClientModule.andThen(init(ctx), userEndedSpace(ctx, UserId.generate(), SpaceId.generate()))

    expect(
      hasExactlyOne(
        output.msgCmd ?? [],
        (msgCmd) =>
          msgCmd.t === 'wire' &&
          msgCmd.c.t === 'send-to-server' &&
          msgCmd.c.toServer?.t === 'got-msg-core' &&
          msgCmd.c.toServer?.c.t === 'user-ended-space'
      )
    ).toBe(true)
  })
})
