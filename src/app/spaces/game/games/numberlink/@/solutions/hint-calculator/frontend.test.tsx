// import { describe, expect, test } from 'bun:test'
// import { Err, Ok } from '~/@/result'

// import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
// import { ShowErrorSmall } from '~/app/@/frontend/show-error-small'
// import { ShowOkSmall } from '~/app/@/frontend/show-ok-small'
// import { ShowWarningSmall } from '~/app/@/frontend/show-warning-small'
// import { FixtureNumberlinkFrontend } from '../../frontend/fixture'
// import { VariantGridShorthand } from '../../variant/grid'
// import { SolutionHash } from '../solution-hash/solution-hash'
// import { Solutions } from '../solutions'
// import { HintCalculatorFrontend } from './frontend'
// import { GotHintCalculatorMsg } from './got-hint-calculator-msg.$msg'

// export const Fixture = async () => {
//   const f = await FixtureNumberlinkFrontend()

//   const numberlink = VariantGridShorthand.toGrid([
//     ['A', ' ', ' '],
//     [' ', ' ', ' '],
//     [' ', ' ', 'A'],
//   ])

//   const solutions = await Solutions.find({ logger: f.ctx.logger, models: [numberlink] })
//   const hash = SolutionHash.init(numberlink)
//   const solution = Solutions.selectOne(solutions, hash)
//   if (!solution) throw new Error('No solution found')
//   return {
//     ...f,
//     numberlink,
//     hash,
//     solutions,
//     solution,
//   }
// }

// describe('HintCalculatorFrontend', () => {
//   test('open dialog', async () => {
//     const f = await Fixture()
//     const before = HintCalculatorFrontend.update({
//       ...f,
//       model: HintCalculatorFrontend.init,
//     })
//     const after = HintCalculatorFrontend.update({
//       ...f,
//       model: before.model,
//       msg: { t: 'dialog.clicked-open' },
//     })
//     expect(before.model.open).toBe(null)
//     expect(after.model.open).toBe('find-solutions-confirmation')
//     expect(PlaySoundCmd.did(after)).toBe(true)
//   })

//   test('toggle open dialog', async () => {
//     const f = await Fixture()
//     const before = HintCalculatorFrontend.update({
//       ...f,
//       model: HintCalculatorFrontend.init,
//       msg: { t: 'dialog.clicked-open' },
//     })
//     const after = HintCalculatorFrontend.update({
//       ...f,
//       model: before.model,
//       msg: { t: 'dialog.clicked-open' },
//     })
//     expect(before.model.open).toBe('find-solutions-confirmation')
//     expect(after.model.open).toBe(null)
//   })

//   test('close dialog', async () => {
//     const f = await Fixture()
//     const before = HintCalculatorFrontend.update({
//       ...f,
//       model: HintCalculatorFrontend.init,
//       msg: { t: 'dialog.clicked-open' },
//     })
//     const after = HintCalculatorFrontend.update({
//       ...f,
//       model: before.model,
//       msg: { t: 'dialog.clicked-close' },
//     })
//     expect(before.model.open).toBe('find-solutions-confirmation')
//     expect(after.model.open).toBeNull()
//     expect(PlaySoundCmd.did(after)).toBe(true)
//   })

//   test('handle got msg cmd', async () => {
//     const f = await Fixture()
//     const actual = HintCalculatorFrontend.update({
//       ...f,
//       model: HintCalculatorFrontend.init,
//       msgIn: GotHintCalculatorMsg.init({ t: 'dialog.clicked-open' }),
//     })
//     const expected = HintCalculatorFrontend.update({
//       ...f,
//       model: HintCalculatorFrontend.init,
//       msg: { t: 'dialog.clicked-open' },
//     })
//     expect(actual).toEqual(expected)
//   })

//   test('clicked find solutions', async () => {
//     const f = await Fixture()

//     const before = HintCalculatorFrontend.update({
//       ...f,
//       model: HintCalculatorFrontend.init,
//       msg: { t: 'dialog.clicked-open' },
//     })

//     const after = HintCalculatorFrontend.update({
//       ...f,
//       model: before.model,
//       msg: { t: 'clicked-find-solutions', numberlink: f.numberlink },
//     })
//     expect(HintCalculatorFrontend.isLoading(after.model, f.hash)).toBe(true)
//     expect(PlaySoundCmd.did(after)).toBe(true)
//     expect(after.eff).not.toBeUndefined()
//   })

//   test('found solution ok', async () => {
//     const f = await Fixture()

//     const before = HintCalculatorFrontend.update({
//       ...f,
//       model: HintCalculatorFrontend.init,
//       msg: { t: 'clicked-find-solutions', numberlink: f.numberlink },
//     })
//     const after = HintCalculatorFrontend.update({
//       ...f,
//       model: before.model,
//       msg: { t: 'found-solution', numberlink: f.numberlink, found: Ok({ solutions: f.solutions }) },
//     })
//     expect(HintCalculatorFrontend.isLoading(after.model, f.hash)).toBe(false)
//     expect(after.model.open).toBe(null)
//     expect(ShowOkSmall.did(after)).toBe(true)
//   })

//   test('found no solutions', async () => {
//     const f = await Fixture()

//     const before = HintCalculatorFrontend.update({
//       ...f,
//       model: HintCalculatorFrontend.init,
//       msg: { t: 'clicked-find-solutions', numberlink: f.numberlink },
//     })
//     const after = HintCalculatorFrontend.update({
//       ...f,
//       model: before.model,
//       msg: { t: 'found-solution', numberlink: f.numberlink, found: Ok({ solutions: Solutions.init }) },
//     })
//     expect(HintCalculatorFrontend.isLoading(after.model, f.hash)).toBe(false)
//     expect(after.model.open).toBe(null)
//     expect(ShowWarningSmall.did(after)).toBe(true)
//   })

//   test('found solution err', async () => {
//     const f = await Fixture()
//     const before = HintCalculatorFrontend.update({
//       ...f,
//       model: HintCalculatorFrontend.init,
//       msg: { t: 'clicked-find-solutions', numberlink: f.numberlink },
//     })
//     const after = HintCalculatorFrontend.update({
//       ...f,
//       model: before.model,
//       msg: { t: 'found-solution', numberlink: f.numberlink, found: Err('some error') },
//     })
//     expect(HintCalculatorFrontend.isLoading(after.model, f.hash)).toBe(false)
//     expect(after.model.open).toBe(null)
//     expect(ShowErrorSmall.did(after)).toBe(true)
//   })

//   test('close surface after finding solutions', async () => {
//     const f = await Fixture()

//     const before = HintCalculatorFrontend.update({
//       ...f,
//       model: HintCalculatorFrontend.init,
//       msg: { t: 'dialog.clicked-open' },
//     })
//     const after = HintCalculatorFrontend.update({
//       ...f,
//       model: before.model,
//       msg: { t: 'found-solution', numberlink: f.numberlink, found: Ok({ solutions: f.solutions }) },
//     })
//     expect(before.model.open).toBe('find-solutions-confirmation')
//     expect(after.model.open).toBe(null)
//     expect(PlaySoundCmd.did(after)).toBe(true)
//   })
// })
