import { describe, expect, it } from 'bun:test'
import { SpaceId } from '~/app/@/data/space-id'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { FixtureSpacesFrontend } from '../@/fixture/frontend'

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should redirect to space list after ending space if on space screen', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      {
        msg: { t: 'start-space.clicked-start-space-button', spaceId },
      },
      {
        msg: { t: 'end-space.clicked-end-space-button', spaceId },
        ctx: { ...f.ctx, currentScreen: { n: 'spaces', t: 'space', spaceId } },
      },
    ])

    expect(PushScreenCmd.did(output)).toBe(true)
  })

  it('should NOT redirect to space list after ending space if NOT on space screen', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      { msg: { t: 'start-space.clicked-start-space-button', spaceId } },
      {
        msg: { t: 'end-space.clicked-end-space-button', spaceId },
        ctx: { ...f.ctx, currentScreen: { n: 'spaces', t: 'space-list' } },
      },
    ])

    expect(PushScreenCmd.did(output)).toBe(false)
  })

  it('should play sound after ending space', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      { msg: { t: 'start-space.clicked-start-space-button', spaceId } },
      {
        msg: { t: 'end-space.clicked-end-space-button', spaceId },
        ctx: { ...f.ctx, currentScreen: { n: 'spaces', t: 'space-list' } },
      },
    ])
    expect(PlaySoundCmd.did(output)).toBe(true)
  })
})
