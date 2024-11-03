import { describe, expect, it, test } from 'bun:test'
import { didShowErrorSm, didShowToast } from 'gamezilla-app/app/@/client'
import { SpaceId } from 'gamezilla-app/app/@/data'
import { FixtureSpaceClient } from '../@/fixture/client'
import * as SpacesCoreClient from '../core/client/spaces-core.client'
import { withEventMeta } from 'gamezilla-app/@/event-sourced/event'

const Fixture = async () => {
  const f = await FixtureSpaceClient()
  return {
    ...f,
    spaceId: SpaceId.generate()
  }
}

describe(import.meta.file, () => {
  test('show toast after joining', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgServer: {
          t: 'got-msg-core',
          c: withEventMeta({
            t: 'user-started-space',
            spaceId: f.spaceId,
            userId: f.userA.userId
          })
        }
      },
      {
        msg: {
          t: 'clicked-join-space-button',
          spaceId: f.spaceId
        }
      }
    ])

    expect(didShowToast(output, (toast) => toast.message === f.ctx.t('spaces.current-user-joined-space'))).toBe(true)
  })

  it('should should toast of other user leaving space', async () => {
    const f = await Fixture()

    const output = f.update(f.initial, [
      {
        msgServer: {
          t: 'got-msg-core',
          c: withEventMeta({
            t: 'user-started-space',
            spaceId: f.spaceId,
            userId: f.ctx.currentUserId
          })
        }
      },
      {
        msgServer: {
          t: 'got-msg-core',
          c: withEventMeta({
            t: 'user-joined-space',
            spaceId: f.spaceId,
            userId: f.userA.userId
          })
        }
      }
    ])

    expect(didShowToast(output)).toBe(true)
  })

  it('should join space when clicking join space button', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgServer: {
          t: 'got-msg-core',
          c: withEventMeta({
            t: 'user-started-space',
            spaceId: f.spaceId,
            userId: f.userA.userId
          })
        }
      },
      {
        msg: {
          t: 'clicked-join-space-button',
          spaceId: f.spaceId
        }
      }
    ])
    expect(SpacesCoreClient.toSpaceIdByUserId(output.model, f.ctx.currentUserId)).toEqual(f.spaceId)
  })

  it('current user leaving joined space', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgServer: {
          t: 'got-msg-core',
          c: withEventMeta({
            t: 'user-started-space',
            spaceId: f.spaceId,
            userId: f.userA.userId
          })
        }
      },
      {
        msg: {
          t: 'clicked-join-space-button',
          spaceId: f.spaceId
        }
      },
      {
        msg: {
          t: 'clicked-leave-space-button',
          spaceId: f.spaceId
        }
      }
    ])
    expect(SpacesCoreClient.toSpaceIdByUserId(output.model, f.ctx.currentUserId)).toEqual(null)
  })

  it('preventing joining a space if already in a space', async () => {
    const f = await Fixture()
    const spaceA = SpaceId.generate()
    const spaceB = SpaceId.generate()

    const output = f.update(f.initial, [
      {
        msgServer: {
          t: 'got-msg-core',
          c: withEventMeta({
            t: 'user-started-space',
            spaceId: spaceA,
            userId: f.userA.userId
          })
        }
      },
      {
        msg: {
          t: 'clicked-join-space-button',
          spaceId: spaceA
        }
      },
      {
        msg: {
          t: 'clicked-join-space-button',
          spaceId: spaceB
        }
      }
    ])

    expect(SpacesCoreClient.toSpaceIdByUserId(output.model, f.ctx.currentUserId)).toEqual(spaceA)
    expect(didShowErrorSm(output)).toBe(true)
  })
})
