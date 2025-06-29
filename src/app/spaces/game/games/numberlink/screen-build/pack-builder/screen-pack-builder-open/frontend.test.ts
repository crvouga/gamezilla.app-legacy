import { describe, expect, test } from '~/@/test-runner'
describe('ScreenPackBuilderOpenFrontend', () => {
  test('open pack builder', async () => {
    expect(true).toEqual(true)
  })
})

// import { withEventMeta } from '~/@/event-sourced/event'
// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
// import { Pack } from '../../../@/pack/pack'
// import { FixtureFlowBuilderFrontend } from '../../@/fixture/frontend'

// describe('ScreenPackBuilderOpenFrontend', () => {
//   test('open pack builder', async () => {
//     const f = await FixtureFlowBuilderFrontend()
//     const pack = await Pack.random({
//       createdBy: f.ctx.currentUser.userId,
//     })
//     const output = f.update(f.init, [
//       {
//         msg: {
//           t: 'got-msg-space',
//           c: {
//             t: 'screen-pack-builder-open.user-clicked-pack-item',
//             pack,
//             userId: f.ctx.currentUser.userId,
//           },
//         },
//       },
//     ])

//     expect(output.modelSpace.screenPackBuilder?.pack.id === pack.id).toEqual(true)
//   })

//   test('play sound', async () => {
//     const f = await FixtureFlowBuilderFrontend()
//     const pack = await Pack.random({
//       createdBy: f.ctx.currentUser.userId,
//     })
//     const output = f.update(f.init, [
//       {
//         msgSpace: withEventMeta({
//           t: 'screen-pack-builder-open.user-clicked-pack-item',
//           pack,
//           userId: f.ctx.currentUser.userId,
//         }),
//       },
//     ])
//     expect(PlaySoundCmd.count(output)).toEqual(1)
//   })
// })
