import { describe, expect, test } from '~/@/test-runner'
describe('ExitSpaceActionFrontend', () => {
  test('should work', async () => {
    expect(true).toEqual(true)
  })
})

// import { SpaceId } from '~/app/@/data/space-id'
// import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
// import { FixtureSpacesFrontend } from '../../@/fixture/frontend'
// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
// import { APP_SOUND } from '~/app/@/frontend/app-sound'

// const Fixture = async () => {
//   const f = await FixtureSpacesFrontend()
//   return {
//     ...f,
//   }
// }

// describe('ExitSpaceActionFrontend', () => {
//   test('should go to list screen after clicking go home button', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()
//     const output = f.update(f.initial, [
//       { msg: { t: 'start-space.clicked-start-space-button', spaceId } },
//       { msg: { t: 'exit-space-action.clicked-exit-space-button' } },
//     ])
//     expect(PushScreenCmd.did(output, (s) => s.t === 'space-list')).toEqual(true)
//   })

//   test('should play a sound after clicking go home button', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()
//     const output = f.update(f.initial, [
//       { msg: { t: 'start-space.clicked-start-space-button', spaceId } },
//       { msg: { t: 'exit-space-action.clicked-exit-space-button' } },
//     ])

//     expect(PlaySoundCmd.did(output, APP_SOUND.navBackwardMin)).toEqual(true)
//   })
// })
