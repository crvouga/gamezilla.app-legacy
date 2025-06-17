// import { describe, expect, it } from 'bun:test'
// import { SpaceId } from '~/app/@/data/space-id'
// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
// import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd'
// import { FixtureSpacesFrontend } from '../../@/fixture/frontend'
// import { SpacesCore } from '../../core/core'

// const Fixture = async () => {
//   const f = await FixtureSpacesFrontend()
//   return {
//     ...f,
//   }
// }

// describe('Test', () => {
//   it('should open current space when clicking current space bottom bar', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()
//     const output = f.update(f.initial, [
//       {
//         msg: {
//           t: 'start-space.clicked-start-space-button',
//           spaceId,
//         },
//       },
//       {
//         msg: {
//           t: 'current-space-bar.clicked-current-space-bottom-bar',
//         },
//       },
//     ])

//     const currentUsersSpaceId = SpacesCore.toSpaceIdByUserId(output.model.spaces, f.ctx.currentUser.userId)

//     expect(PushScreenCmd.did(output, (m) => m.t === 'space' && m.spaceId === currentUsersSpaceId)).toBe(true)
//   })

//   it('should play a sound when clicking current space bottom bar', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()

//     const output = f.update(f.initial, [
//       {
//         msg: {
//           t: 'start-space.clicked-start-space-button',
//           spaceId,
//         },
//       },
//       {
//         msg: {
//           t: 'current-space-bar.clicked-current-space-bottom-bar',
//         },
//       },
//     ])

//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })
// })
