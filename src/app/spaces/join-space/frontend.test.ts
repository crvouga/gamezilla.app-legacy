import { describe, expect, it, test } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { FixtureSpacesFrontend } from '../@/fixture/frontend'
import { Spaces } from '../space/spaces'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ShowErrorSmall } from '~/app/@/frontend/show-error-small'

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()
  return {
    ...f,
    spaceId: SpaceId.generate(),
  }
}

describe('join space', () => {
  test('show toast after current user joining', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-started-space', spaceId: f.spaceId, userId: f.userA.id }),
        },
      },
      {
        msg: { t: 'join-space.submitted-join-space-form', spaceId: f.spaceId },
      },
    ])

    expect(ShowToastCmd.did(output, (toast) => toast.text === f.ctx.t('spaces.current-user-joined-space'))).toBe(true)
  })

  test('show toast after other user joining', async () => {
    const f = await Fixture()
    const otherUser = await UserProfile.random()
    const output = f.update(f.initial, [
      {
        ctx: {
          ...f.ctx,
          profilesByUserId: {
            [otherUser.id]: otherUser,
          },
        },
        msg: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-started-space', spaceId: f.spaceId, userId: f.currentUser.userId }),
        },
      },
      {
        ctx: {
          ...f.ctx,
          profilesByUserId: {
            [otherUser.id]: otherUser,
          },
        },
        msg: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-joined-space', spaceId: f.spaceId, userId: otherUser.id }),
        },
      },
    ])

    const expectedText = f.ctx.t('spaces.other-user-joined-space', otherUser.username)
    expect(ShowToastCmd.did(output, (toast) => toast.text === expectedText)).toBe(true)
  })

  it('should should toast of other user leaving space', async () => {
    const f = await Fixture()

    const output = f.update(f.initial, [
      {
        msg: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-started-space', spaceId: f.spaceId, userId: f.ctx.currentUser!.userId }),
        },
      },
      {
        msg: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-joined-space', spaceId: f.spaceId, userId: f.userA.id }),
        },
      },
    ])

    expect(ShowToastCmd.did(output)).toBe(true)
  })

  it('should join space when clicking join space button', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-started-space', spaceId: f.spaceId, userId: f.userA.id }),
        },
      },
      {
        msg: { t: 'join-space.submitted-join-space-form', spaceId: f.spaceId },
      },
    ])
    expect(Spaces.toSpaceIdByUserId(output.model.spaces, f.ctx.currentUser!.userId)).toEqual(f.spaceId)
  })

  it('current user leaving joined space', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-started-space', spaceId: f.spaceId, userId: f.userA.id }),
        },
      },
      { msg: { t: 'join-space.submitted-join-space-form', spaceId: f.spaceId } },
      { msg: { t: 'leave-space.clicked-leave-space-button', spaceId: f.spaceId } },
    ])
    expect(Spaces.toSpaceIdByUserId(output.model.spaces, f.ctx.currentUser!.userId)).toEqual(null)
  })

  it('preventing joining a space if already in a space', async () => {
    const f = await Fixture()
    const spaceA = SpaceId.generate()
    const spaceB = SpaceId.generate()

    const output = f.update(f.initial, [
      {
        msg: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-started-space', spaceId: spaceA, userId: f.userA.id }),
        },
      },
      { msg: { t: 'join-space.submitted-join-space-form', spaceId: spaceA } },
      { msg: { t: 'join-space.submitted-join-space-form', spaceId: spaceB } },
    ])

    expect(Spaces.toSpaceIdByUserId(output.model.spaces, f.ctx.currentUser!.userId)).toEqual(spaceA)
    expect(ShowErrorSmall.did(output)).toBe(true)
  })

  it('opens person details surface when clicking person list item', async () => {
    const f = await Fixture()
    const someUserId = UserId.generate()
    const output = f.update(f.initial, [{ msg: { t: 'join-space.clicked-person-list-item', userId: someUserId } }])
    expect(output.model.opened).toBe('join-space.person-preview-surface')
    expect(PlaySoundCmd.did(output)).toBe(true)
  })

  it('toggles person details surface when clicking the same person list item again', async () => {
    const f = await Fixture()
    const someUserId = UserId.generate()
    const before = f.update(f.initial, [{ msg: { t: 'join-space.clicked-person-list-item', userId: someUserId } }])
    const after = f.update(before, [{ msg: { t: 'join-space.clicked-person-list-item', userId: someUserId } }])
    expect(before.model.opened).toBe('join-space.person-preview-surface')
    expect(after.model.opened).toBe(null)
    expect(PlaySoundCmd.did(after)).toBe(true)
  })

  it('closes person details surface when closing surface', async () => {
    const f = await Fixture()
    const someUserId = UserId.generate()
    const before = f.update(f.initial, [{ msg: { t: 'join-space.clicked-person-list-item', userId: someUserId } }])
    const after = f.update(before, [{ msg: { t: 'join-space.closed-person-item-surface' } }])
    expect(before.model.opened).toBe('join-space.person-preview-surface')
    expect(after.model.opened).toBe(null)
    expect(PlaySoundCmd.did(after)).toBe(true)
  })

  it('pushes route to profile page when opening person details', async () => {
    const f = await Fixture()
    const someUserId = UserId.generate()
    const output = f.update(f.initial, [{ msg: { t: 'join-space.opened-person-details', userId: someUserId } }])
    expect(PushScreenCmd.did(output, (m) => m.t === 'profile' && m.userId === someUserId)).toBe(true)
  })
})
