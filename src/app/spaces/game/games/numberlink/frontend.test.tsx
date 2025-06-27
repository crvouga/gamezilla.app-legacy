// import { describe, expect, it } from 'bun:test'
// import { withEventMeta } from '~/@/event-sourced/event'
// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
// import { FixtureNumberlinkFrontend } from './@/frontend/fixture'

// const Fixture = async () => {
//   const f = await FixtureNumberlinkFrontend()
//   return {
//     ...f,
//   }
// }

// describe('Test', () => {
//   it('should play a sound when selecting play mode', async () => {
//     const f = await Fixture()
//     const output = f.update(f.initial, [
//       {
//         msgSpace: withEventMeta({
//           t: 'user-changed-mode',
//           userId: f.ctx.currentUser.userId,
//           mode: 'play',
//         }),
//       },
//     ])
//     expect(PlaySoundCmd.count(output)).toEqual(1)
//   })

//   it('should play a sound when selecting create mode', async () => {
//     const f = await Fixture()
//     const output = f.update(f.initial, [
//       {
//         msgSpace: withEventMeta({
//           t: 'user-changed-mode',
//           userId: f.ctx.currentUser.userId,
//           mode: 'build',
//         }),
//       },
//     ])
//     expect(PlaySoundCmd.count(output)).toEqual(1)
//   })

//   it('should not play a sound when selecting no mode', async () => {
//     const f = await Fixture()
//     const output = f.update(f.initial, [
//       {
//         msgSpace: withEventMeta({
//           t: 'user-changed-mode',
//           userId: f.ctx.currentUser.userId,
//           mode: 'none',
//         }),
//       },
//     ])
//     expect(PlaySoundCmd.count(output)).toEqual(1)
//   })
// })
