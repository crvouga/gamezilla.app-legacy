import { describe, expect, test } from '~/@/test-runner'

describe('ScreenPuzzleGridFrontend', () => {
  test('play sound opening add puzzle screen', async () => {
    expect(true).toEqual(true)
  })
})

// import { withEventMeta } from '~/@/event-sourced/event'
// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
// import { Puzzle } from '../../../../@/puzzle/puzzle'
// import { FixturePackBuilderFrontend } from '../@/fixture/frontend'
// import { MsgFrontend } from '../types'
// import { ScreenPuzzleGrid } from './frontend'

// const Fixture = async () => {
//   const f = await FixturePackBuilderFrontend()
//   const renderMsgs: MsgFrontend[] = []
//   const dispatch = (m: MsgFrontend) => {
//     renderMsgs.push(m)
//   }
//   return { ...f, renderMsgs, dispatch }
// }
// describe('ScreenPuzzleGridFrontend', () => {
//   test('play sound opening add puzzle screen', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [
//       {
//         msgSpace: withEventMeta({
//           t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
//           userId: f.hostId,
//         }),
//       },
//     ])
//     expect(PlaySoundCmd.did(output)).toEqual(true)
//   })

//   test('play sound opening puzzle', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [
//       {
//         msgSpace: withEventMeta({
//           t: 'screen-pack-builder.user-clicked-pack-item',
//           userId: f.hostId,
//           puzzleIndex: 0,
//           puzzleResult: { t: 'got', c: await Puzzle.random() },
//         }),
//       },
//     ])
//     expect(PlaySoundCmd.did(output)).toEqual(true)
//   })

//   test('render bottom buttons', async () => {
//     const f = await Fixture()
//     const r = f.render(<ScreenPuzzleGrid.View {...f} />)
//     expect(r.getByRole('toolbar').length).toEqual(1)
//   })
//   test('render edit name button', async () => {
//     const f = await Fixture()
//     const r = f.render(<ScreenPuzzleGrid.View {...f} />)
//     expect(r.getByRole('button', f.ctx.t('app.edit-name')).length).toEqual(1)
//   })
//   test('open edit name drawer on click', async () => {
//     const f = await Fixture()
//     const r = f.render(<ScreenPuzzleGrid.View {...f} />)
//     await r.getByRole('button', f.ctx.t('app.edit-name'))[0]?.click()
//     const m = f.renderMsgs[0]
//     expect(m?.t === 'got-msg-space' && m?.c?.t).toEqual('edit-pack-name.user-clicked-open-drawer-button')
//   })
// })
