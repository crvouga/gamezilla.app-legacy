import { describe, expect, it, test } from 'bun:test'
import { ScreenBuildSpaceFixture } from './@/fixture/space'
import { Pack } from '../@/pack/pack'
import { UserId } from '~/app/@/data/user-id'
import { Ok } from '~/@/result'

export const Fixture = async () => {
  const f = await ScreenBuildSpaceFixture()
  return f
}
describe('Test', () => {
  test('enter and exit pack builder', async () => {
    const f = await Fixture()
    const pack = await Pack.random()
    const userId = UserId.generate()
    const before = f.update(f.initial, [
      {
        t: 'screen-pack-builder-open.user-clicked-pack-item',
        pack,
        userId,
      },
    ])
    const after = f.update(before, [
      {
        t: 'got-screen-pack-builder-msg',
        c: {
          t: 'screen-pack-builder.user-clicked-back-button',
          userId,
        },
      },
    ])
    expect(before.screen.t).toEqual('screen-pack-builder')
    expect(after.screen.t).toEqual('screen-pack-builder-open')
  })

  it('should open pack builder after user creates a new pack', async () => {
    const f = await Fixture()
    const pack = await Pack.random()
    const modelSpace = f.update(f.initial, [
      {
        t: 'create-new-pack.user-created-pack',
        userId: pack.createdBy,
        created: Ok(pack),
      },
    ])
    expect(modelSpace).toBeTruthy()
    expect(modelSpace.screen.t).toEqual('screen-pack-builder')
  })
})
