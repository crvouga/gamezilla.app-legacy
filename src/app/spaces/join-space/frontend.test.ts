import { withEventMeta } from '~/@/event-sourced/event'
import { describe, expect, it, test } from 'bun:test'
import { FixtureSpacesFrontend } from '../@/fixture/frontend'
import { SpacesCore } from '../core/core'
import { SpaceId } from '~/app/@/data/space-id'
import { Profile } from '~/app/@/data/profile'
import { didShowToast, didShowErrorSm } from '~/app/@/frontend/cmd'
import { UserId } from '~/app/@/data/user-id'

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()
  return {
    ...f,
    spaceId: SpaceId.generate(),
  }
}

describe.only(import.meta.file, () => {
  test('show toast after current user joining', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgBackend: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-started-space', spaceId: f.spaceId, userId: f.userA.userId }),
        },
      },
      {
        msg: { t: 'join-space.submitted-join-space-form', spaceId: f.spaceId },
      },
    ])

    expect(didShowToast(output, (toast) => toast.message === f.ctx.t('spaces.current-user-joined-space'))).toBe(true)
  })

  test('show toast after other user joining', async () => {
    const f = await Fixture()
    const otherUser = await Profile.random()
    const output = f.update(f.initial, [
      {
        msgBackend: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-started-space', spaceId: f.spaceId, userId: f.currentUser.userId }),
        },
      },
      {
        msgBackend: {
          profiles: { [otherUser.userId]: otherUser },
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-joined-space', spaceId: f.spaceId, userId: otherUser.userId }),
        },
      },
    ])

    expect(
      didShowToast(output, (toast) => toast.message === f.ctx.t('spaces.other-user-joined-space', otherUser.username)),
    ).toBe(true)
  })

  it('should should toast of other user leaving space', async () => {
    const f = await Fixture()

    const output = f.update(f.initial, [
      {
        msgBackend: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-started-space', spaceId: f.spaceId, userId: f.ctx.currentUserId }),
        },
      },
      {
        msgBackend: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-joined-space', spaceId: f.spaceId, userId: f.userA.userId }),
        },
      },
    ])

    expect(didShowToast(output)).toBe(true)
  })

  it('should join space when clicking join space button', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgBackend: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-started-space', spaceId: f.spaceId, userId: f.userA.userId }),
        },
      },
      {
        msg: { t: 'join-space.submitted-join-space-form', spaceId: f.spaceId },
      },
    ])
    expect(SpacesCore.toSpaceIdByUserId(output.model.spaces, f.ctx.currentUserId)).toEqual(f.spaceId)
  })

  it('current user leaving joined space', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgBackend: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-started-space', spaceId: f.spaceId, userId: f.userA.userId }),
        },
      },
      { msg: { t: 'join-space.submitted-join-space-form', spaceId: f.spaceId } },
      { msg: { t: 'leave-space.clicked-leave-space-button', spaceId: f.spaceId } },
    ])
    expect(SpacesCore.toSpaceIdByUserId(output.model.spaces, f.ctx.currentUserId)).toEqual(null)
  })

  it('preventing joining a space if already in a space', async () => {
    const f = await Fixture()
    const spaceA = SpaceId.generate()
    const spaceB = SpaceId.generate()

    const output = f.update(f.initial, [
      {
        msgBackend: {
          t: 'sync.got-msg-space',
          c: withEventMeta({ t: 'user-started-space', spaceId: spaceA, userId: f.userA.userId }),
        },
      },
      { msg: { t: 'join-space.submitted-join-space-form', spaceId: spaceA } },
      { msg: { t: 'join-space.submitted-join-space-form', spaceId: spaceB } },
    ])

    expect(SpacesCore.toSpaceIdByUserId(output.model.spaces, f.ctx.currentUserId)).toEqual(spaceA)
    expect(didShowErrorSm(output)).toBe(true)
  })

  it('opens person details surface when clicking person list item', async () => {
    const f = await Fixture()
    const someUserId = UserId.generate()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'join-space.clicked-person-list-item',
          userId: someUserId,
        },
      },
    ])
    expect(output.model.opened).toBe('join-space.person-preview-surface')
  })
})
