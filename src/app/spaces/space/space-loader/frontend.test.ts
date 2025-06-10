import { describe, expect, test } from 'bun:test'
import { SpaceId } from '~/app/@/data/space-id'
import { FixtureSpacesFrontend } from '../../@/fixture/frontend'
import { Spaces } from '../spaces'

const Fixture = async () => {
  const f = await FixtureSpacesFrontend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  test.todo('persist current user space on an interval', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const started = f.update(f.initial, [{ msg: { t: 'start-space.clicked-start-space-button', spaceId } }])
    expect(Spaces.toSpaceIdByUserId(started.model.spaces, f.ctx.currentUser!.userId)).toBe(spaceId)
  })
})
