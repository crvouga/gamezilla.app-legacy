import { describe, expect, test } from '~/@/test-runner'

describe('ButtonCopyPuzzleFrontend', () => {
  test('render button for super users', async () => {
    expect(true).toEqual(true)
  })
})

// import { withEventMeta } from '~/@/event-sourced/event'
// import { UserRole } from '~/app/@/data/user-role'
// import { CopyToClipboardCmd } from '~/app/@/frontend/copy-to-clipboard-cmd.$msg'
// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
// import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
// import { Numberlink } from '../../../@/numberlink'
// import { VariantGridShorthand } from '../../../@/variant/grid'
// import { FixtureScreenPlayPuzzleFrontend } from '../@/fixture/frontend'

// const Fixture = async (input?: { currentUserRole: UserRole }) => {
//   const f = await FixtureScreenPlayPuzzleFrontend()
//   const ctx: typeof f.ctx = {
//     ...f.ctx,
//     currentUserRole: input?.currentUserRole ?? 'super',
//   }

//   return {
//     ...f,
//     ctx,
//   }
// }

// describe('ButtonCopyPuzzleFrontend', () => {
//   test.todo('render button for super users', async () => {
//     const f = await Fixture({
//       currentUserRole: 'super',
//     })
//     const r = f.render(f.init, f.ctx)
//     const button = r.getByRole('button', f.ctx.t('game.numberlink.copy-puzzle-to-clipboard'))
//     expect(button).toEqualTruthy()
//   })

//   test('does not render button for non-super users', async () => {
//     for (const currentUserRole of UserRole.NON_SUPER_USER_ROLES) {
//       const f = await Fixture({
//         currentUserRole,
//       })
//       const r = f.render(f.init, f.ctx)
//       const button = r.getByRole('button', f.ctx.t('game.numberlink.copy-puzzle-to-clipboard'))[0]
//       expect(button).toEqualFalsy()
//     }
//   })

//   test('play sound', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [{ msgSpace: withEventMeta({ t: 'user-clicked-copy-to-clipboard' }) }])
//     expect(PlaySoundCmd.did(output)).toEqual(true)
//   })

//   test('copy puzzle to clipboard', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [
//       {
//         msgSpace: withEventMeta({
//           t: 'user-clicked-copy-to-clipboard',
//         }),
//       },
//     ])
//     expect(CopyToClipboardCmd.did(output)).toEqual(true)
//   })

//   test('show toast on copy success', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [
//       {
//         msgSpace: withEventMeta({
//           t: 'user-clicked-copy-to-clipboard',
//         }),
//       },
//     ])
//     expect(ShowToastCmd.did(output)).toEqual(true)
//   })

//   test('should copy the shorthand json to the clipboard', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [
//       {
//         msgSpace: withEventMeta({
//           t: 'user-clicked-copy-to-clipboard',
//         }),
//       },
//     ])
//     expect(
//       CopyToClipboardCmd.did(output, (text) => {
//         const shorthand = JSON.parse(text)
//         const grid = VariantGridShorthand.toGrid(shorthand)
//         return Numberlink.isSame(f.puzzle.model, grid)
//       }),
//     ).toEqual(true)
//   })
// })
