import { describe, expect, it } from 'bun:test'
import { SpaceId } from '~/app/@/data/space-id'
import { FixtureSpacesClient } from '../../@/fixture/client'

const Fixture = async () => {
  const f = FixtureSpacesClient()
  return {
    ...f
  }
}

describe(import.meta.file, () => {
  it('should go to list screen when clicking go home button', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId
        }
      },
      {
        msg: {
          t: 'clicked-go-home-button'
        }
      }
    ])

    expect(output.msgCmd?.some((m) => m.t === 'routing' && m.c.t === 'push' && m.c.route.t === 'space-list')).toBe(true)
  })

  it('should play a sound when clicking go home button', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'clicked-start-space-button',
          spaceId
        }
      },
      {
        msg: {
          t: 'clicked-go-home-button'
        }
      }
    ])

    expect(output.msgCmd?.some((msgCmd) => msgCmd.t === 'sound' && msgCmd.c.t === 'play')).toBe(true)
  })
})
