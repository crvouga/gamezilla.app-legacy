import { describe, expect, it } from 'bun:test'
import { countPlaySoundCmd } from 'gamezilla-app/app/@/client'
import { withEventMeta } from '../../@/event'
import { FlowClientFixture } from './@/testing'

const Fixture = async () => {
  const f = await FlowClientFixture()
  return {
    ...f
  }
}

describe(import.meta.file, () => {
  it('should play a sound when selecting play mode', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgCore: withEventMeta({
          t: 'user-changed-mode',
          userId: f.ctx.currentUserId,
          mode: 'play'
        })
      }
    ])
    expect(countPlaySoundCmd(output)).toEqual(1)
  })

  it('should play a sound when selecting create mode', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgCore: withEventMeta({
          t: 'user-changed-mode',
          userId: f.ctx.currentUserId,
          mode: 'builder'
        })
      }
    ])
    expect(countPlaySoundCmd(output)).toEqual(1)
  })

  it('should not play a sound when selecting no mode', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgCore: withEventMeta({
          t: 'user-changed-mode',
          userId: f.ctx.currentUserId,
          mode: null
        })
      }
    ])
    expect(countPlaySoundCmd(output)).toEqual(1)
  })
})
