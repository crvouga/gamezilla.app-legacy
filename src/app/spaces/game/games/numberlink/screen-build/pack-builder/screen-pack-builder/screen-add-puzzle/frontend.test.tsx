// import { describe, expect, test } from 'vitest'
// import { withEventMeta } from '~/@/event-sourced/event'
// import { sleep } from '~/@/promise/sleep'
// import { Sub } from '~/@/sub'
// import { TimeSpan } from '~/@/time/time-span'

// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
// import { PuzzleQuery } from '../../../../@/puzzle/puzzle-db/interface-query'
// import { FixturePackBuilderFrontend } from '../@/fixture/frontend'
// import { MsgFrontend } from '../types'
// import { ScreenAddPuzzle } from './frontend'
// import { ScreenAddPuzzleSpace } from './space'

// const Fixture = async () => {
//   const f = await FixturePackBuilderFrontend()
//   const renderMsg = Sub.create<MsgFrontend>()
//   const render = (input: { model: typeof f.model; modelSpace: typeof f.modelSpace }) => {
//     return f.render(
//       <ScreenAddPuzzle.View ctx={f.ctx} dispatch={renderMsg.pub} model={input.model} modelSpace={input.modelSpace} />,
//     )
//   }
//   return {
//     ...f,
//     render,
//     renderMsg,
//   }
// }

// describe('ScreenAddPuzzleFrontend', () => {
//   test('play sound sound clicking puzzle list item', async () => {
//     const f = await Fixture()

//     const output = ScreenAddPuzzle.update({
//       ...f,
//       msgSpace: withEventMeta({
//         t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
//         userId: f.ctx.currentUser.userId,
//         puzzleId: f.puzzle.id,
//       }),
//     })

//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   test('submit button should be disabled when no puzzles are selected', async () => {
//     const f = await Fixture()
//     const output = ScreenAddPuzzle.update({ ...f })
//     const r = f.render({ model: output.model, modelSpace: f.modelSpace })
//     const submitButton = r.query("[type='submit']")[0]
//     expect(submitButton?.disabled).toBe(true)
//   })

//   test('submit button should NOT be disabled when some puzzles are selected', async () => {
//     const f = await Fixture()
//     const modelSpace = ScreenAddPuzzleSpace.updateSpace({
//       ...f,
//       msgSpace: withEventMeta({
//         t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
//         userId: f.ctx.currentUser.userId,
//         puzzleId: f.puzzle.id,
//       }),
//     })
//     const r = f.render({ model: f.model, modelSpace })
//     const submitButton = r.query("[type='submit']")[0]
//     expect(submitButton?.disabled).toBe(false)
//   })

//   test('play sound when puzzle db query changes', async () => {
//     const f = await Fixture()
//     const output = ScreenAddPuzzle.update({
//       ...f,
//       msgSpace: withEventMeta({
//         t: 'screen-pack-builder.screen-add-puzzle.puzzle-db-query-query-changed',
//         userId: f.ctx.currentUser.userId,
//         query: PuzzleQuery.random(),
//       }),
//     })

//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   test('play sound toggling header checkbox', async () => {
//     const f = await Fixture()
//     const output = ScreenAddPuzzle.update({
//       ...f,
//       msgSpace: withEventMeta({
//         t: 'screen-pack-builder.screen-add-puzzle.user-clicked-header-checkbox',
//         userId: f.ctx.currentUser.userId,
//         puzzleIds: [f.puzzle.id],
//       }),
//     })

//     expect(PlaySoundCmd.did(output)).toBe(true)
//   })

//   test('clicking checkbox', async () => {
//     const f = await Fixture()
//     const r = f.render({ model: f.model, modelSpace: f.modelSpace })
//     let msgs: MsgFrontend[] = []
//     f.renderMsg.sub((msg) => msgs.push(msg))
//     const checkbox = r.query("[role='checkbox']")[0]
//     expect(checkbox).toBeTruthy()
//     await checkbox?.click()
//     await sleep(TimeSpan.milliseconds(100))
//     expect(msgs.length).toBe(1)
//     expect(msgs[0]?.t).toBe('got-msg-space')
//     expect(msgs[0]?.t === 'got-msg-space' && msgs[0]?.c?.t).toBe(
//       'screen-pack-builder.screen-add-puzzle.user-clicked-header-checkbox',
//     )
//   })
// })
