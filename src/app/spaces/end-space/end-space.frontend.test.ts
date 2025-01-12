import { describe, expect, it } from 'bun:test'
import { didPlaySound, didPushRoute } from '~/app/@/frontend/cmd'
import { SpaceId } from '~/app/@/data/space-id'
import { FixtureSpacesFrontend } from '../@/fixture/frontend'

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should redirect to space list after ending space if on space route', async () => {
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
          currentRoute: {
            n: 'spaces',
            t: 'space',
            spaceId,
          },
        },
      },
    ])

    expect(didPushRoute(output)).toBe(true)
  })

  it('should not redirect to space list after ending space if not on space route', async () => {
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
          currentRoute: {
            n: 'spaces',
            t: 'space-list',
          },
        },
      },
    ])

    expect(didPushRoute(output)).toBe(false)
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
          currentRoute: {
            n: 'spaces',
            t: 'space-list',
          },
        },
      },
    ])
    expect(didPlaySound(output)).toBe(true)
  })
})
