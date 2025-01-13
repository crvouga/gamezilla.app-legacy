import { describe, expect, it } from 'bun:test'
import { SpaceId } from '~/app/@/data/space-id'
import { FixtureSpacesFrontend } from '../../@/fixture/frontend'

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should go to list screen after clicking go home button', async () => {
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
          t: 'clicked-go-home-button',
        },
      },
    ])

    const didPush = output.msgCmd?.some(
      (m) => m.t === 'current-screen' && m.c.t === 'push' && m.c.screen.t === 'space-list',
    )
    expect(didPush).toBe(true)
  })

  it('should play a sound after clicking go home button', async () => {
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
          t: 'clicked-go-home-button',
        },
      },
    ])

    expect(output.msgCmd?.some((msgCmd) => msgCmd.t === 'sound' && msgCmd.c.t === 'play')).toBe(true)
  })
})
