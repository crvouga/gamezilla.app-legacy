// import { describe, expect, test } from 'vitest'
// import { withEventMeta } from '~/@/event-sourced/event'
// import { Sub } from '~/@/sub'
// import { UserId } from '~/app/@/data/user-id'
// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
// import { Numberlink } from '../../@/numberlink'
// import { FixtureScreenPlayPuzzleFrontend } from './@/fixture/frontend'

import { describe } from 'node:test'

// const Fixture = async () => {
//   const f = await FixtureScreenPlayPuzzleFrontend()
//   return {
//     ...f,
//   }
// }

// describe('ScreenPlayPuzzleFrontend', () => {
//   test('should render puzzle screen after opening puzzle from pack', async () => {
//     const f = await Fixture()
//     const r = f.render(f.init)
//     expect(r.getAttribute('data-puzzle-id')).toBe(f.puzzle.id)
//   })

//   test('should render exit button for puzzle screen', async () => {
//     const f = await Fixture()
//     expect(f.render(f.init).getByRole('button', f.ctx.t('app.exit'))).toBeTruthy()
//   })

//   test('should make a sound after clicking exit button', async () => {
//     const f = await Fixture()
//     const updated = f.update(f.init, [
//       { msgSpace: withEventMeta({ t: 'user-clicked-exit-play-puzzle-screen', userId: f.hostId }) },
//     ])
//     expect(PlaySoundCmd.did(updated)).toBe(true)
//   })

//   test('should exit to pack after clicking exit puzzle button', async () => {
//     const f = await Fixture()
//     const updated = f.update(f.init, [
//       { msg: { t: 'got-msg-space', c: { userId: f.hostId, t: 'user-clicked-exit-play-puzzle-screen' } } },
//     ])
//     expect(updated.modelSpace.screen.t).toBe('screen-select-puzzle')
//   })

//   test('should render next puzzle button only when puzzle is completed', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [...f.msgsCompletePuzzle])
//     const before = f.render(f.init).getByRole('button', f.ctx.t('app.next'))[0]
//     const after = f.render(output).getByRole('button', f.ctx.t('app.next'))[0]

//     expect(before).toBeFalsy()
//     expect(after).toBeTruthy()
//   })

//   test('should dispatch msg after clicking next puzzle button', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [...f.msgsCompletePuzzle])
//     const r = f.render(output)
//     const nextButton = r.getByRole('button', f.ctx.t('app.next'))[0]
//     nextButton?.click()
//     const msg = await Sub.take(r.msgs)
//     expect(msg.t === 'got-msg-space' && msg.c.t === 'user-clicked-next-puzzle').toBe(true)
//   })

//   test('next button', async () => {
//     const f = await Fixture()
//     await f.completePuzzle()

//     const [nextButton] = await f.driver.query('button[data-test-id="next"]')
//     await nextButton?.action({ t: 'click' })

//     const [nextPuzzle] = await f.driver.query(`[data-test-id="${f.nextPuzzle.c.id}"]`)
//     expect(nextPuzzle).toBeTruthy()
//   })

//   test('should render next puzzle after clicking next puzzle button', async () => {
//     const f = await Fixture()
//     const updated = f.update(f.init, [
//       {
//         msg: {
//           t: 'got-msg-space',
//           c: {
//             t: 'user-clicked-next-puzzle',
//             nextPuzzle: f.nextPuzzle,
//             nextPuzzleIndex: f.nextPuzzleIndex,
//             userId: f.hostId,
//           },
//         },
//       },
//     ])
//     const r = f.render(updated)
//     expect(r.getAttribute('data-puzzle-id')).toBe(f.nextPuzzle.c.id)
//   })

//   test('should play sound after user clicks next puzzle button', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [
//       {
//         msgSpace: withEventMeta({
//           t: 'user-clicked-next-puzzle',
//           nextPuzzle: f.nextPuzzle,
//           nextPuzzleIndex: f.nextPuzzleIndex,
//           userId: f.hostId,
//         }),
//       },
//     ])
//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   test('should render which level of the pack is being played', async () => {
//     const f = await Fixture()
//     const r = f.render(f.init)
//     expect(r.getByRole('heading', `Level ${f.puzzleIndex + 1}`)).toBeTruthy()
//   })

//   test('should render puzzle complete dialog after completing a puzzle', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, f.msgsCompletePuzzle)
//     const r = f.render(output)
//     expect(r.getByRole('dialog')[0]?.getByRole('heading', f.ctx.t('game.numberlink.puzzle-completed'))).toBeTruthy()
//   })

//   test('should render next puzzle button in completion dialog', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, f.msgsCompletePuzzle)
//     const r = f.render(output)
//     expect(r.getByRole('dialog')[0]?.getByRole('button', f.ctx.t('game.numberlink.next-puzzle'))[0]).toBeTruthy()
//   })

//   test('should play sound after completing a puzzle', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, f.msgsCompletePuzzle)
//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   test('should play sound pressing down on a terminal', async () => {
//     const f = await Fixture()
//     const terminal = Numberlink.randomTerminal(f.puzzle.model)

//     if (!terminal) throw new Error('No terminal found')

//     const output = f.update(f.init, [
//       {
//         msgSpace: withEventMeta({
//           t: 'got-numberlink-play-msg',
//           userId: UserId.generate(),
//           c: { t: 'user-pressed-down-node', nodeId: terminal.startId },
//         }),
//       },
//     ])
//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   test('should play sound after solving puzzle', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, f.msgsCompletePuzzle)
//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   test('reset button render', async () => {
//     const f = await Fixture()
//     expect(f.render(f.init).getByRole('button', f.ctx.t('app.reset'))).toBeTruthy()
//   })

//   test('hint button render', async () => {
//     const f = await Fixture()
//     expect(f.render(f.init).getByRole('button', f.ctx.t('game.hint'))).toBeTruthy()
//   })

//   test('hint button click', async () => {
//     const f = await Fixture()
//     const r = f.render(f.init)
//     const btn = r.getByRole('button', f.ctx.t('game.hint'))[0]
//     expect(btn).toBeTruthy()
//     btn?.click()
//     const msg = await Sub.take(r.msgs)
//     expect(msg.t).toBe('got-msg-out')
//   })

//   test.skip('not render hint button when puzzle is solved', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [...f.msgsCompletePuzzle])
//     const r = f.render(output)
//     const btn = r.getByRole('button', f.ctx.t('game.hint'))[0]
//     expect(btn).toBeFalsy()
//   })

//   test('not render next button on last puzzle', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [...f.msgsCompleteLastPuzzle])
//     const r = f.render(output)
//     const btn = r.getByRole('button', f.ctx.t('app.next'))[0]
//     expect(btn).toBeFalsy()
//   })

//   test('close puzzle complete dialog sound', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [
//       ...f.msgsCompletePuzzle,
//       {
//         msgSpace: withEventMeta({
//           t: 'user-closed-puzzle-complete-dialog',
//           userId: f.hostId,
//         }),
//       },
//     ])
//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   test('toggle action drawer sound', async () => {
//     const f = await Fixture()
//     const output = f.update(f.init, [
//       {
//         msgSpace: withEventMeta({
//           t: 'user-toggled-action-buttons-drawer',
//           userId: f.hostId,
//         }),
//       },
//     ])
//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   describe('when puzzle is not found', () => {
//     test.skip('hidden hint button', async () => {
//       const f = await Fixture()
//       const output = f.update(f.init, [
//         ...f.msgsCompletePuzzle,
//         {
//           msgSpace: withEventMeta({
//             t: 'user-clicked-next-puzzle',
//             nextPuzzle: { t: 'not-found' },
//             nextPuzzleIndex: f.nextPuzzleIndex,
//             userId: f.hostId,
//           }),
//         },
//       ])
//       expect(f.render(output).getByRole('button', f.ctx.t('game.hint'))).toEqual([])
//     })

//     test('hidden reset button', async () => {
//       const f = await Fixture()
//       const output = f.update(f.init, [
//         {
//           msgSpace: withEventMeta({
//             t: 'user-clicked-next-puzzle',
//             nextPuzzle: {
//               t: 'not-found',
//             },
//             nextPuzzleIndex: f.nextPuzzleIndex,
//             userId: f.hostId,
//           }),
//         },
//       ])
//       expect(f.render(output).getByRole('button', f.ctx.t('app.reset'))).toEqual([])
//     })

//     test('hidden copy to clipboard button', async () => {
//       const f = await Fixture()
//       const output = f.update(f.init, [
//         {
//           msgSpace: withEventMeta({
//             t: 'user-clicked-next-puzzle',
//             nextPuzzle: {
//               t: 'not-found',
//             },
//             nextPuzzleIndex: f.nextPuzzleIndex,
//             userId: f.hostId,
//           }),
//         },
//       ])
//       expect(f.render(output, { ...f.ctx, currentUserRole: 'super' }).getByRole('button', f.ctx.t('app.copy'))).toEqual(
//         [],
//       )
//     })

//     test('visible next puzzle button', async () => {
//       const f = await Fixture()
//       const output = f.update(f.init, [
//         {
//           msgSpace: withEventMeta({
//             t: 'user-clicked-prev-puzzle',
//             prevPuzzle: f.prevPuzzle,
//             prevPuzzleIndex: f.prevPuzzleIndex,
//             userId: f.hostId,
//           }),
//         },
//         {
//           msgSpace: withEventMeta({
//             t: 'user-clicked-next-puzzle',
//             nextPuzzle: {
//               t: 'not-found',
//             },
//             nextPuzzleIndex: f.puzzleIndex,
//             userId: f.hostId,
//           }),
//         },
//       ])
//       expect(f.render(output).getByRole('button', f.ctx.t('app.next')).length).toBe(1)
//     })
//   })
// })

describe.todo('ScreenPlayPuzzleFrontend', () => {})
