import { describe, expect, it } from 'bun:test'
import { didPlaySound, didPushScreen } from '~/app/@/frontend/cmd'
import { SpaceId } from '~/app/@/data/space-id'
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
        msg: {
          t: 'clicked-start-space-button',
          spaceId,
        },
      },
      {
        msg: {
          t: 'clicked-end-space-button',
          spaceId,
        },
        ctx: {
          ...f.ctx,
          currentScreen: {
            n: 'spaces',
            t: 'space',
            spaceId,
          },
        },
      },
    ])

    expect(didPushScreen(output)).toBe(true)
  })

  it('should not redirect to space list after ending space if not on space screen', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId,
        },
      },
      {
        msg: {
          t: 'clicked-end-space-button',
          spaceId,
        },
        ctx: {
          ...f.ctx,
          currentScreen: {
            n: 'spaces',
            t: 'space-list',
          },
        },
      },
    ])

    expect(didPushScreen(output)).toBe(false)
  })

  it('should play sound after ending space', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId,
        },
      },
      {
        msg: {
          t: 'clicked-end-space-button',
          spaceId,
        },
        ctx: {
          ...f.ctx,
          currentScreen: {
            n: 'spaces',
            t: 'space-list',
          },
        },
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })
})
