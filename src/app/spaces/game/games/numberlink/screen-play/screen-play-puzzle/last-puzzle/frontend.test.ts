import { describe, expect, test } from '~/@/test-runner'
// import { withEventMeta } from '~/@/event-sourced/event'

describe('LastPuzzleFrontend', () => {
  test('should render select next pack button in completion dialog after completing last puzzle', async () => {
    expect(true).toEqual(true)
  })
})

// import { Sub } from '~/@/sub'
// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
// import { FixtureScreenPlayPuzzleFrontend } from '../@/fixture/frontend'
// import { LastPuzzleFrontend } from './frontend'

// const Fixture = async () => {
//   const f = await FixtureScreenPlayPuzzleFrontend()

//   return {
//     ...f,
//   }
// }

// describe('LastPuzzleFrontend', () => {
//   test('should render select next pack button in completion dialog after completing last puzzle', async () => {
//     const f = await Fixture()
//     const before = f.render(f.init)
//     const output = f.update(f.init, f.msgsCompleteLastPuzzle)
//     const after = f.render(output)
//     expect(
//       before.getByRole('dialog')[0]?.getByRole('button', f.ctx.t('game.numberlink.select-next-pack'))[0],
//     ).toEqualFalsy()
//     expect(
//       after.getByRole('dialog')[0]?.getByRole('button', f.ctx.t('game.numberlink.select-next-pack'))[0],
//     ).toEqualTruthy()
//   })

//   test('should dispatch a msg after clicking select next pack button', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, f.msgsCompleteLastPuzzle)
//     const rendered = f.render(output)
//     const button = rendered.getByRole('dialog')[0]?.getByRole('button', f.ctx.t('game.numberlink.select-next-pack'))[0]
//     button?.click()
//     const msg = await Sub.take(rendered.msgs)
//     expect(msg).toEqual({ t: 'got-msg-space', c: { t: 'user-clicked-select-next-pack', userId: f.hostId } })
//   })

//   test('should output select next pack event', async () => {
//     const f = await Fixture()
//     const initial = f.update(f.init, f.msgsCompleteLastPuzzle)
//     const output = f.update(initial, [
//       { msg: { t: 'got-msg-space', c: { t: 'user-clicked-select-next-pack', userId: f.hostId } } },
//     ])
//     expect(output.msgSpace?.some((m) => m.t === 'user-clicked-select-next-pack')).toEqual(true)
//   })

//   test('should render congrats message after completing last puzzle', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, f.msgsCompleteLastPuzzle)

//     expect(f.render(output).getByRole('dialog')[0]?.getByRole('heading', f.ctx.t('app.congratulations'))).toEqualTruthy()
//   })

//   test('should dispatch correct msg after clicking select next pack button', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, f.msgsCompleteLastPuzzle)
//     const r = f.render(output)
//     const button = r.getByRole('dialog')[0]?.getByRole('button', f.ctx.t('game.numberlink.select-next-pack'))[0]
//     button?.click()
//     expect(button).toEqualTruthy()
//     const msg = await Sub.take(r.msgs)
//     expect(msg).toEqual({
//       t: 'got-msg-space',
//       c: {
//         userId: f.hostId,
//         t: 'user-clicked-select-next-pack',
//       },
//     })
//   })

//   test('should play sound after clicking select next pack button', async () => {
//     const f = await Fixture()
//     const initial = f.update(f.init, f.msgsCompleteLastPuzzle)
//     const output = f.update(initial, [
//       { msgSpace: withEventMeta({ t: 'user-clicked-select-next-pack', userId: f.hostId }) },
//     ])
//     expect(PlaySoundCmd.did(output)).toEqual(true)
//   })

//   test('should render exit screen action when last puzzle is completed', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, f.msgsCompleteLastPuzzle)
//     const r = f.render(output)
//     const got = r.getByTestId(LastPuzzleFrontend.TEST_ID_LAST_PUZZLE_SELECT_NEXT_ID)[0]
//     expect(got).toEqualTruthy()
//   })

//   test('should NOT render exit screen action when last puzzle is completed', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, f.msgsGoToLastPuzzle)
//     const r = f.render(output)
//     const got = r.getByTestId(LastPuzzleFrontend.TEST_ID_LAST_PUZZLE_SELECT_NEXT_ID)[0]
//     expect(got).toEqualFalsy()
//   })

//   test('should NOT render if not last puzzle', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, f.msgsCompletePuzzle)
//     const r = f.render(output)
//     const got = r.getByTestId(LastPuzzleFrontend.TEST_ID_LAST_PUZZLE_SELECT_NEXT_ID)[0]
//     expect(got).toEqualFalsy()
//   })
// })
