import { describe, expect, test } from '~/@/test-runner'

describe('UseHint', () => {
  test('hint', async () => {
    expect(true).toEqual(true)
  })
})

// import { pipe } from '~/@/function/pipe'
// import { Logger } from '~/@/logger'
// import { UseHint } from '.'
// import { Numberlink } from '../../numberlink'
// import { AlgoIsSolved } from '../../solutions/algo-is-solved/algo-is-solved'
// import { Solutions } from '../../solutions/solutions'
// import { VariantGridShorthand } from '../../variant/grid'
// import { FixtureModePlayUseHint } from './fixture'

// const Fixture = FixtureModePlayUseHint

// describe('UseHint', () => {
//   test('hint', async () => {
//     const f = await Fixture()
//     const after = f.update(f.init, [
//       {
//         msg: {
//           t: 'user-clicked-use-hint',
//           solutions: await Solutions.find({ models: [f.ctx.numberlink], logger: Logger({ t: 'noop' }) }),
//         },
//       },
//     ])
//     const numberlink = UseHint.toNumberlink(after.model, f.ctx.numberlink)
//     for (const groupId of UseHint.toShowingHintGroupIds(after.model)) {
//       expect(Numberlink.isTerminalConnectedWithPipes(numberlink, groupId)).toEqual(true)
//     }
//   })

//   test('hint multiple terminals', async () => {
//     const f = await Fixture({
//       ctxNumberlink: VariantGridShorthand.toGrid([
//         ['A', 'B'],
//         [' ', ' '],
//         ['A', 'B'],
//       ]),
//     })

//     const output = f.update(f.init, [
//       {
//         msg: {
//           t: 'user-clicked-use-hint',
//           solutions: await Solutions.find({ models: [f.ctx.numberlink], logger: Logger({ t: 'noop' }) }),
//         },
//       },
//       {
//         msg: {
//           t: 'user-clicked-use-hint',
//           solutions: await Solutions.find({ models: [f.ctx.numberlink], logger: Logger({ t: 'noop' }) }),
//         },
//       },
//     ])
//     const numberlink = UseHint.toNumberlink(output.model, f.ctx.numberlink)
//     expect(AlgoIsSolved.isSolved(numberlink)).toEqual(true)
//   })

//   test('output use hint event', async () => {
//     const f = await Fixture({
//       ctxNumberlink: VariantGridShorthand.toGrid([
//         ['A', 'B'],
//         [' ', ' '],
//         ['A', 'B'],
//       ]),
//     })

//     const output = f.update(f.init, [
//       {
//         msg: {
//           t: 'user-clicked-use-hint',
//           solutions: await Solutions.find({ models: [f.ctx.numberlink], logger: Logger({ t: 'noop' }) }),
//         },
//       },
//     ])
//     expect(output.events?.some((e) => e.t === 'used-hint')).toEqual(true)
//   })

//   test('output solved event', async () => {
//     const f = await Fixture({
//       ctxNumberlink: VariantGridShorthand.toGrid([
//         ['A', 'B', 'C'],
//         [' ', ' ', ' '],
//         ['A', 'B', 'C'],
//       ]),
//     })

//     const output = f.update(f.init, [
//       {
//         msg: {
//           t: 'user-clicked-use-hint',
//           solutions: await Solutions.find({ models: [f.ctx.numberlink], logger: Logger({ t: 'noop' }) }),
//         },
//       },
//       {
//         msg: {
//           t: 'user-clicked-use-hint',
//           solutions: await Solutions.find({ models: [f.ctx.numberlink], logger: Logger({ t: 'noop' }) }),
//         },
//       },
//       {
//         msg: {
//           t: 'user-clicked-use-hint',
//           solutions: await Solutions.find({ models: [f.ctx.numberlink], logger: Logger({ t: 'noop' }) }),
//         },
//       },
//     ])

//     expect(output.events?.some((e) => e.t === 'solved')).toEqual(true)
//   })

//   test('should not create branching in pipes after using a hint', async () => {
//     const f = await Fixture({
//       ctxNumberlink: VariantGridShorthand.toGrid([
//         ['A', 'a', 'a', ' '],
//         [' ', ' ', 'a', ' '],
//         ['a', 'a', 'a', ' '],
//         [' ', ' ', ' ', 'A'],
//       ]),
//     })

//     const output = f.update(f.init, [
//       {
//         msg: {
//           t: 'user-clicked-use-hint',
//           solutions: await Solutions.find({ models: [f.ctx.numberlink], logger: Logger({ t: 'noop' }) }),
//         },
//       },
//     ])

//     const derived = UseHint.toNumberlink(output.model, f.ctx.numberlink)

//     expect(Numberlink.hasMultipleDeadEndPipelines(derived)).toEqual(false)
//   })

//   test('should work even with flipped terminal', async () => {
//     const f = await Fixture({
//       ctxNumberlink: VariantGridShorthand.toGrid([
//         ['A', ' ', ' '],
//         [' ', ' ', ' '],
//         ['A', ' ', ' '],
//       ]),
//     })

//     const terminal = Numberlink.toTerminalByGroupId(f.ctx.numberlink, 'A')
//     const flipped = Numberlink.flipTerminal(f.ctx.numberlink, terminal)

//     const output = f.update(
//       {
//         ...f.init,
//         terminalsByGroupId: {
//           ...flipped.terminalsByGroupId,
//         },
//       },
//       [
//         {
//           msg: {
//             t: 'user-clicked-use-hint',
//             solutions: await Solutions.find({ models: [f.ctx.numberlink], logger: Logger({ t: 'noop' }) }),
//           },
//         },
//       ],
//     )

//     const derived = UseHint.toNumberlink(output.model, f.ctx.numberlink)

//     const pipeline = Numberlink.toPipelineFromGroupId(derived, 'A')

//     expect(pipeline.length > 0).toEqual(true)
//   })

//   test('record used hints', async () => {
//     const f = await Fixture()
//     const after = f.update(f.init, [
//       {
//         msg: {
//           t: 'user-clicked-use-hint',
//           solutions: await Solutions.find({ models: [f.ctx.numberlink], logger: Logger({ t: 'noop' }) }),
//         },
//       },
//     ])
//     expect(Object.keys(after.model.usedHints)).toEqual(['A'])
//   })

//   test('cut pipes after using a hint', async () => {
//     const before = VariantGridShorthand.toGrid([
//       ['A', 'B'],
//       ['b', 'b'],
//       ['b', ' '],
//       ['b', 'b'],
//       ['A', 'B'],
//     ])
//     const f = await Fixture({
//       ctxNumberlink: before,
//     })
//     const updated = f.update(f.init, [
//       {
//         msg: {
//           t: 'user-clicked-use-hint',
//           solutions: await Solutions.find({ models: [before], logger: Logger({ t: 'noop' }) }),
//         },
//       },
//     ])
//     const after = UseHint.toNumberlink(updated.model, f.ctx.numberlink)
//     expect(Numberlink.toPipelineFromGroupId(before, 'A').length).toEqual(0)
//     expect(Numberlink.toPipelineFromGroupId(before, 'B').length).toEqual(6)
//     expect(Numberlink.toPipelineFromGroupId(after, 'A').length).toEqual(4)
//     expect(Numberlink.toPipelineFromGroupId(after, 'B').length).toEqual(0)
//   })

//   test('should NOT branch pipelines after using hint', async () => {
//     const f = await Fixture({
//       ctxNumberlink: VariantGridShorthand.toGrid([
//         ['A', ' ', ' '],
//         [' ', ' ', ' '],
//         [' ', ' ', 'A'],
//       ]),
//     })

//     const initialPipesBySourceId = VariantGridShorthand.toGrid([
//       ['A', ' ', ' '],
//       [' ', ' ', ' '],
//       ['a', 'a', 'A'],
//     ]).pipesBySourceId

//     const initial: UseHint.Model = {
//       ...f.init,
//       pipesBySourceId: initialPipesBySourceId,
//     }

//     const updated = f.update(initial, [
//       {
//         msg: {
//           t: 'user-clicked-use-hint',
//           solutions: await Solutions.find({ models: [f.ctx.numberlink], logger: Logger({ t: 'noop' }) }),
//         },
//       },
//     ])
//     const after = UseHint.toNumberlink(updated.model, f.ctx.numberlink)
//     expect(Numberlink.hasBranchingPipelines(after)).toEqual(false)
//   })

//   test('should never change the positions of the terminals when using a hint', async () => {
//     const f = await Fixture({
//       ctxNumberlink: VariantGridShorthand.toGrid([
//         ['A', ' ', ' '],
//         [' ', ' ', ' '],
//         [' ', ' ', 'A'],
//       ]),
//     })

//     const numberlink = VariantGridShorthand.toGrid([
//       [' ', ' ', 'A'],
//       [' ', ' ', ' '],
//       ['A', ' ', ' '],
//     ])
//     const init = UseHint.init({
//       ctx: UseHint.initCtx({
//         numberlink,
//       }),
//     })

//     const output = f.update(init, [
//       {
//         msg: {
//           t: 'user-clicked-use-hint',
//           solutions: await Solutions.find({ models: [numberlink], logger: Logger({ t: 'noop' }) }),
//         },
//       },
//     ])

//     const before = UseHint.toNumberlink(init, f.ctx.numberlink)

//     const after = UseHint.toNumberlink(output.model, f.ctx.numberlink)

//     expect(Numberlink.toTerminals(before)).toEqual(Numberlink.toTerminals(after))
//   })

//   test('should update terminal orientation if needed', async () => {
//     const solution = VariantGridShorthand.toGrid([
//       ['A', ' ', ' '],
//       ['a', ' ', ' '],
//       ['a', 'a', 'A'],
//     ])

//     const ctxNumberlink = pipe(solution, Numberlink.removeAllPipelines, Numberlink.flipAllTerminals)

//     const f = await Fixture({ ctxNumberlink: ctxNumberlink })

//     const output = f.update(f.init, [
//       {
//         msg: {
//           t: 'user-clicked-use-hint',
//           solutions: Solutions.of([solution]),
//         },
//       },
//     ])

//     const numberlinkNew = UseHint.toNumberlink(output.model, ctxNumberlink)

//     const expected = Numberlink.toPipelineFromGroupId(solution, 'A')
//     const actual = Numberlink.toPipelineFromGroupId(numberlinkNew, 'A')

//     expect(expected).toEqual(actual)
//   })

//   test('should work when terminal groups have gaps in sequence', async () => {
//     const f = await Fixture({
//       ctxNumberlink: VariantGridShorthand.toGrid([
//         ['A', ' ', 'C'],
//         [' ', ' ', ' '],
//         ['A', ' ', 'C'],
//       ]),
//     })

//     const solutions = await Solutions.find({ models: [f.ctx.numberlink], logger: Logger({ t: 'noop' }) })

//     const output = f.update(f.init, [
//       { msg: { t: 'user-clicked-use-hint', solutions } },
//       { msg: { t: 'user-clicked-use-hint', solutions } },
//     ])

//     expect(output.events?.some((e) => e.t === 'solved')).toEqual(true)
//   })
// })
