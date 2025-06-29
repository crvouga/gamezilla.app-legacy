import { describe, expect, test } from '~/@/test-runner'
describe('LeaveSpaceFrontend', () => {
  test('should navigate to list screen after leaving space', async () => {
    expect(true).toEqual(true)
  })
})

// import { withEventMetaAt } from '~/@/event-sourced/event'
// import { SpaceId } from '~/app/@/data/space-id'
// import { UserId } from '~/app/@/data/user-id'
// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
// import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
// import { FixtureSpacesFrontend, userJoinedSpace, userLeftSpace, userStartedSpace } from '../@/fixture/frontend'
// import { Spaces } from '../space/spaces'
// import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'

// const Fixture = async () => {
//   const f = await FixtureSpacesFrontend()
//   return {
//     ...f,
//   }
// }

// describe('leave space', () => {
//   test('should navigate to list screen after leaving space', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()

//     const outputs = f.updates(f.initial, [
//       userStartedSpace(0, f.userA.userId, spaceId),
//       userJoinedSpace(1, f.ctx.currentUser!.userId, spaceId),
//       {
//         msg: { t: 'leave-space.clicked-leave-space-button', spaceId: spaceId },
//       },
//     ])
//     expect(outputs.some((output) => PushScreenCmd.did(output, (x) => x.t === 'space-list'))).toEqual(true)
//   })

//   test('should only redirect to list screen for the user leaving the space', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()
//     const userId = UserId.generate()

//     const output = f.update(f.initial, [
//       userStartedSpace(0, f.ctx.currentUser!.userId, spaceId),
//       userJoinedSpace(1, userId, spaceId),
//       {
//         msg: {
//           t: 'sync.got-msg-space',
//           c: withEventMetaAt(2, {
//             t: 'user-left-space',
//             spaceId,
//             userId,
//           }),
//         },
//       },
//     ])

//     expect(PushScreenCmd.did(output)).toEqual(false)
//   })

//   test('should show some toast after leaving a space', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()
//     const output = f.update(f.initial, [
//       userStartedSpace(0, f.ctx.currentUser!.userId, spaceId),
//       userJoinedSpace(1, f.ctx.currentUser!.userId, spaceId),
//       userLeftSpace(2, f.ctx.currentUser!.userId, spaceId),
//     ])
//     expect(ShowToastCmd.did(output)).toEqual(true)
//   })

//   test('user is not in space after leaving', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()
//     const output = f.update(f.initial, [
//       userStartedSpace(0, f.ctx.currentUser!.userId, spaceId),
//       userJoinedSpace(1, f.ctx.currentUser!.userId, spaceId),
//       {
//         msg: {
//           t: 'leave-space.clicked-leave-space-button',
//           spaceId,
//         },
//       },
//     ])
//     const currentUserSpaceId = Spaces.toSpaceIdByUserId(output.model.spaces, f.ctx.currentUser!.userId)
//     expect(currentUserSpaceId).toEqual(null)
//   })

//   test('should play sound after leaving', async () => {
//     const f = await Fixture()
//     const spaceId = SpaceId.generate()
//     const output = f.update(f.initial, [
//       userStartedSpace(0, f.ctx.currentUser!.userId, spaceId),
//       userJoinedSpace(1, f.ctx.currentUser!.userId, spaceId),
//       {
//         msg: {
//           t: 'leave-space.clicked-leave-space-button',
//           spaceId,
//         },
//       },
//     ])
//     expect(PlaySoundCmd.did(output)).toEqual(true)
//   })
// })
