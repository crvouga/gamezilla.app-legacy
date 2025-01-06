import { describe, expect, it } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { countPlaySoundCmd } from '~/app/@/client/cmd'
import { FixtureFlowClient } from './@/client/fixture'

const Fixture = async () => {
  const f = await FixtureFlowClient()
  return {
    ...f,
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
          mode: 'play',
        }),
      },
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
          mode: 'builder',
        }),
      },
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
          mode: 'none',
        }),
      },
    ])
    expect(countPlaySoundCmd(output)).toEqual(1)
  })
})
