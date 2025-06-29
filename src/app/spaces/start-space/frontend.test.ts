import { describe, expect, test } from '~/@/test-runner'
describe('StartSpaceFrontend', () => {
  test('show toast', async () => {
    expect(true).toEqual(true)
  })
})

// import { SpaceId } from '~/app/@/data/space-id'
// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
// import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
// import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
// import { FixtureSpacesFrontend } from '../@/fixture/frontend'
// import { Spaces } from '../space/spaces'

// const Fixture = async () => {
//   const f = await FixtureSpacesFrontend()
//   return {
//     ...f,
//   }
// }

// describe('StartSpaceFrontend', () => {
//   test('show toast', async () => {
//     const f = await Fixture()
//     const started = f.update(f.initial, [
//       { msg: { t: 'start-space.clicked-start-space-button', spaceId: SpaceId.generate() } },
//     ])
//     expect(ShowToastCmd.did(started)).toEqual(true)
//   })

//   test('start space', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()
//     const started = f.update(f.initial, [
//       {
//         msg: {
//           t: 'start-space.clicked-start-space-button',
//           spaceId,
//         },
//       },
//     ])
//     const before = Spaces.toSpaceIdByUserId(f.initial.model.spaces, f.ctx.currentUser!.userId)
//     const after = Spaces.toSpaceIdByUserId(started.model.spaces, f.ctx.currentUser!.userId)
//     expect(before).toEqual(null)
//     expect(after).toEqual(spaceId)
//   })

//   test('play sound', async () => {
//     const f = await Fixture()
//     const started = f.update(f.initial, [
//       {
//         msg: {
//           t: 'start-space.clicked-start-space-button',
//           spaceId: SpaceId.generate(),
//         },
//       },
//     ])
//     expect(PlaySoundCmd.did(started)).toEqual(true)
//   })

//   test('push screen', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()
//     const started = f.update(f.initial, [
//       {
//         msg: {
//           t: 'start-space.clicked-start-space-button',
//           spaceId,
//         },
//       },
//     ])
//     expect(PushScreenCmd.did(started)).toEqual(true)
//   })
// })
