import { describe, expect, it } from 'bun:test'
import { SpaceId } from '~/app/@/data/space-id'
import { FixtureSpacesFrontend } from '../../@/fixture/frontend'
import { SpacesCoreFrontend } from '../../core/frontend'

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should open current space when clicking current space bottom bar', async () => {
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
          t: 'clicked-current-space-bottom-bar',
        },
      },
    ])

    const currentUsersSpaceId = SpacesCoreFrontend.toSpaceIdByUserId(output.model, f.ctx.currentUserId)

    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === 'routing' &&
          msgCmd.c.t === 'push' &&
          msgCmd.c.route.t === 'space' &&
          msgCmd.c.route.spaceId === currentUsersSpaceId,
      ),
    ).toBe(true)
  })

  it('should play a sound when clicking current space bottom bar', async () => {
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
          t: 'clicked-current-space-bottom-bar',
        },
      },
    ])

    expect(output.msgCmd?.some((msgCmd) => msgCmd.t === 'sound' && msgCmd.c.t === 'play')).toBe(true)
  })
})
