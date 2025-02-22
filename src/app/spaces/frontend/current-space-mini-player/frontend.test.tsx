import { describe, expect, it } from 'bun:test'
import { SpaceId } from '~/app/@/data/space-id'
import { FixtureSpacesFrontend } from '../../@/fixture/frontend'
import { SpacesCore } from '../../core/core'

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
          t: 'start-space.clicked-start-space-button',
          spaceId,
        },
      },
      {
        msg: {
          t: 'current-space-bar.clicked-current-space-bottom-bar',
        },
      },
    ])

    const currentUsersSpaceId = SpacesCore.toSpaceIdByUserId(output.model.spaces, f.ctx.currentUser.userId)

    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === 'current-screen' &&
          msgCmd.c.t === 'push' &&
          msgCmd.c.screen.t === 'space' &&
          msgCmd.c.screen.spaceId === currentUsersSpaceId,
      ),
    ).toBe(true)
  })

  it('should play a sound when clicking current space bottom bar', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()

    const output = f.update(f.initial, [
      {
        msg: {
          t: 'start-space.clicked-start-space-button',
          spaceId,
        },
      },
      {
        msg: {
          t: 'current-space-bar.clicked-current-space-bottom-bar',
        },
      },
    ])

    expect(output.msgCmd?.some((msgCmd) => msgCmd.t === 'sound' && msgCmd.c.t === 'play')).toBe(true)
  })
})
