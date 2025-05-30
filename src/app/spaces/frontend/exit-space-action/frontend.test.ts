import { describe, expect, it } from 'bun:test'
import { SpaceId } from '~/app/@/data/space-id'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd'
import { FixtureSpacesFrontend } from '../../@/fixture/frontend'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { APP_SOUND } from '~/app/@/frontend/app-sound'

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
      { msg: { t: 'start-space.clicked-start-space-button', spaceId } },
      { msg: { t: 'exit-space-action.clicked-exit-space-button' } },
    ])
    expect(PushScreenCmd.did(output, (s) => s.t === 'space-list')).toBe(true)
  })

  it('should play a sound after clicking go home button', async () => {
    const f = await Fixture()
    const spaceId = SpaceId.generate()
    const output = f.update(f.initial, [
      { msg: { t: 'start-space.clicked-start-space-button', spaceId } },
      { msg: { t: 'exit-space-action.clicked-exit-space-button' } },
    ])

    expect(PlaySoundCmd.did(output, APP_SOUND.navBackwardMin)).toBe(true)
  })
})
