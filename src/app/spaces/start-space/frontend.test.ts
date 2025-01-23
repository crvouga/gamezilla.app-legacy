import { describe, expect, test } from 'bun:test'
import { didPlaySound, didPushScreen, didSendToBackend, didShowToast } from '~/app/@/frontend/cmd'
import { SpaceId } from '~/app/@/data/space-id'
import { FixtureSpacesFrontend } from '../@/fixture/frontend'
import { SpacesCore } from '../core/core'

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  test('show toast', async () => {
    const f = await Fixture()
    const started = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId: SpaceId.generate(),
        },
      },
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
          spaceId,
        },
      },
    ])
    const before = SpacesCore.toSpaceIdByUserId(f.initial.model, f.ctx.currentUserId)
    const after = SpacesCore.toSpaceIdByUserId(started.model, f.ctx.currentUserId)
    expect(before).toEqual(null)
    expect(after).toEqual(spaceId)
  })

  test('play sound', async () => {
    const f = await Fixture()
    const started = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId: SpaceId.generate(),
        },
      },
    ])
    expect(didPlaySound(started)).toBe(true)
  })

  test('push screen', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const started = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId,
        },
      },
    ])
    expect(didPushScreen(started)).toBe(true)
  })

  test('send to backend', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const started = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId,
        },
      },
    ])
    expect(
      didSendToBackend(
        started,
        (msg) => msg.t === 'got-msg-space' && msg.c.t === 'user-started-space' && msg.c.userId === f.ctx.currentUserId,
      ),
    ).toBe(true)
  })
})
