import { describe, expect, it } from 'bun:test'
import { eq } from '~/@/equals/equals'
import { withEventMetaAt } from '~/@/event-sourced/event'
import { addProfiles } from '~/app/@/frontend/cmd'
import { Profile } from '~/app/@/data/profile'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Username } from '~/app/@/data/username'
import { FixtureSpacesFrontend } from '../@/fixture/frontend'
import { makeSpace } from '../@/fixture/shared'
import { SpacesCoreFrontend } from '../core/frontend'
import { SpaceCore } from '../core/space-core'

const hasExactlyOne = <T>(items: T[], predicate: (item: T) => boolean): boolean => {
  return items.filter(predicate).length === 1
}

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should record profiles when received from backend', async () => {
    const f = await Fixture()

    const someProfile: Profile = {
      userId: UserId.generate(),
      avatarUrl: 'some url',
      username: await Username.generate(),
    }

    const someProfiles: {
      [userId: UserId]: Profile
    } = {
      [someProfile.userId]: someProfile,
    }

    const output = f.update(f.initial, [
      {
        msgBackend: {
          t: 'listed-spaces',
          spaces: [],
          profiles: someProfiles,
        },
      },
    ])
    expect(hasExactlyOne(output.msgCmd ?? [], (msgCmd) => eq(msgCmd, addProfiles(someProfiles)))).toBe(true)
  })

  it('should merge space received from backend', async () => {
    const f = await Fixture()

    const someSpace = makeSpace({
      spaceId: SpaceId.generate(),
      hostId: UserId.generate(),
    })

    const output = f.update(f.initial, [
      {
        msgBackend: {
          t: 'synced',
          space: someSpace,
        },
      },
    ])

    const listed = SpacesCoreFrontend.listSpaces({
      model: output.model,
      offset: 0,
      limit: Number.POSITIVE_INFINITY,
    })

    expect(listed.some((space) => SpaceCore.isEqual(space, someSpace))).toBe(true)
  })

  it("should merge current user's space when received from backend", async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const someStartedSpace = makeSpace({
      spaceId,
      hostId: f.ctx.currentUserId,
    })

    const output = f.update(f.initial, [
      {
        msgBackend: {
          t: 'current-user-space',
          space: someStartedSpace,
          currentUser: f.ctx.currentUser,
        },
      },
    ])

    const currentUserSpaceId = SpacesCoreFrontend.toSpaceIdByUserId(output.model, f.ctx.currentUserId)

    expect(currentUserSpaceId).toEqual(spaceId)
  })

  it("should sync current user's space when backend connects if in space", async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId: SpaceId.generate(),
        },
      },
      {
        msgEvt: {
          t: 'wire-evt.backend-connected',
        },
      },
    ])

    expect(
      hasExactlyOne(
        output.msgCmd ?? [],
        (msgCmd) => msgCmd.t === 'wire' && msgCmd.c.t === 'send-to-backend' && msgCmd.c.toBackend?.t === 'sync',
      ),
    ).toBe(true)
  })

  it('should send events to the backend like user joined space', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      {
        msgBackend: {
          t: 'got-msg-core',
          c: withEventMetaAt(0, {
            t: 'user-started-space',
            spaceId,
            userId: UserId.generate(),
          }),
        },
      },
      {
        msg: {
          t: 'clicked-join-space-button',
          spaceId,
        },
      },
    ])

    expect(
      hasExactlyOne(
        output?.msgCmd ?? [],
        (msgCmd) =>
          msgCmd.t === 'wire' &&
          msgCmd.c.t === 'send-to-backend' &&
          msgCmd.c.toBackend?.t === 'got-msg-core' &&
          msgCmd.c.toBackend?.c.t === 'user-joined-space',
      ),
    ).toBe(true)
  })

  it('should send events to the backend like user ended space', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      {
        msgBackend: {
          t: 'got-msg-core',
          c: withEventMetaAt(0, {
            t: 'user-ended-space',
            spaceId,
            userId: UserId.generate(),
          }),
        },
      },
    ])

    expect(
      hasExactlyOne(
        output.msgCmd ?? [],
        (msgCmd) =>
          msgCmd.t === 'wire' &&
          msgCmd.c.t === 'send-to-backend' &&
          msgCmd.c.toBackend?.t === 'got-msg-core' &&
          msgCmd.c.toBackend?.c.t === 'user-ended-space',
      ),
    ).toBe(true)
  })
})
