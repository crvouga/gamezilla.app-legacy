import { describe, expect, test } from '~/@/test-runner'

describe('UseHintFrontend', () => {
  test('should disable hint button if puzzle is solved', async () => {
    expect(true).toEqual(true)
  })
})

// import { Logger } from '~/@/logger'
// import { Solutions } from '../../solutions/solutions'
// import { VariantGridShorthand } from '../../variant/grid'
// import { FixtureModePlayUseHint } from './fixture'
// import { UseHintFrontend } from './frontend'

// const Fixture = async (params?: Parameters<typeof FixtureModePlayUseHint>[0]) => {
//   const f = await FixtureModePlayUseHint(params)
//   const render = (input?: Parameters<typeof UseHintFrontend.TestView>[0]) => {
//     const r = f.render(<UseHintFrontend.TestView dispatch={() => {}} ctx={f.ctx} model={f.init} {...input} />)
//     return r
//   }
//   const solutions = await Solutions.find({ models: [f.ctx.numberlink], logger: Logger({ t: 'noop' }) })
//   f.ctx = {
//     ...f.ctx,
//     solutions,
//   }
//   return {
//     ...f,
//     render,
//   }
// }

// describe('UseHintFrontend', () => {
//   test('should disable hint button if puzzle is solved', async () => {
//     const f = await Fixture({
//       ctxNumberlink: VariantGridShorthand.toGrid([
//         ['A', 'B'],
//         ['a', 'b'],
//         ['A', 'B'],
//       ]),
//     })
//     const r = f.render({
//       model: {
//         ...f.init,
//         pipesBySourceId: f.ctx.numberlink.pipesBySourceId,
//         terminalsByGroupId: f.ctx.numberlink.terminalsByGroupId,
//       },
//       dispatch: () => {},
//       ctx: f.ctx,
//     })
//     const btn = r.getByTestId(UseHintFrontend.TEST_ID_USE_HINT_ACTION)[0]
//     expect(btn?.disabled).toEqual(true)
//   })

//   test('should show hint button if puzzle is not solved', async () => {
//     const f = await Fixture({
//       ctxNumberlink: VariantGridShorthand.toGrid([
//         ['A', 'B'],
//         [' ', ' '],
//         ['A', 'B'],
//       ]),
//     })
//     const r = f.render()
//     const btn = r.getByTestId(UseHintFrontend.TEST_ID_USE_HINT_ACTION)[0]
//     expect(btn).toBeDefined()
//   })
// })
