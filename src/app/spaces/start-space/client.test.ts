import { describe, expect, test } from 'bun:test'
import { didPlaySound, didPushRoute, didSendToServer, didShowToast } from '~/app/@/client/client-cmd'
import { SpaceId } from '~/app/@/data/space-id'
import { FixtureSpacesClient } from '../@/fixture/client'
import { SpacesCoreClient } from '../core/client'

const Fixture = async () => {
  const f = await FixtureSpacesClient()
  return {
    ...f
  }
}

describe(import.meta.file, () => {
  test('show toast', async () => {
    const f = await Fixture()
    const started = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId: SpaceId.generate()
        }
      }
    ])
    expect(didShowToast(started)).toBe(true)
  })

  test('start space', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const started = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId
        }
      }
    ])
    const before = SpacesCoreClient.toSpaceIdByUserId(f.initial.model, f.ctx.currentUserId)
    const after = SpacesCoreClient.toSpaceIdByUserId(started.model, f.ctx.currentUserId)
    expect(before).toEqual(null)
    expect(after).toEqual(spaceId)
  })

  test('play sound', async () => {
    const f = await Fixture()
    const started = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId: SpaceId.generate()
        }
      }
    ])
    expect(didPlaySound(started)).toBe(true)
  })

  test('push route', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const started = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId
        }
      }
    ])
    expect(didPushRoute(started)).toBe(true)
  })

  test('send to server', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const started = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId
        }
      }
    ])
    expect(
      didSendToServer(
        started,
        (msg) => msg.t === 'got-msg-core' && msg.c.t === 'user-started-space' && msg.c.userId === f.ctx.currentUserId
      )
    ).toBe(true)
  })
})
