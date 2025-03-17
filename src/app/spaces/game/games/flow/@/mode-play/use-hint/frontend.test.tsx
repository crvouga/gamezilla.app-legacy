import { describe, expect, it } from 'bun:test'
import { VariantGridShorthand } from '../../variant/grid'
import { FixtureModePlayUseHint } from './fixture'
import { UseHintFrontend } from './frontend'
import { Solutions } from '../../solutions/solutions'
import { loggerNoop } from '~/@/logger/impl-noop'

const Fixture = async (params?: Parameters<typeof FixtureModePlayUseHint>[0]) => {
  const f = await FixtureModePlayUseHint(params)
  const render = (input?: Parameters<typeof UseHintFrontend.TestView>[0]) => {
    const r = f.render(<UseHintFrontend.TestView dispatch={() => {}} ctx={f.ctx} model={f.init} {...input} />)
    return r
  }
  const solutions = await Solutions.find({ models: [f.ctx.flow], logger: loggerNoop })
  f.ctx = {
    ...f.ctx,
    solutions,
  }
  return {
    ...f,
    render,
  }
}

describe('UseHintFrontend', () => {
  it('should hide hint button if puzzle is solved', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', 'B'],
        ['a', 'b'],
        ['A', 'B'],
      ]),
    })
    const r = f.render()
    const btn = r.getByTestId(UseHintFrontend.TEST_ID_USE_HINT_ACTION)[0]
    expect(btn).not.toBeDefined()
  })

  it('should show hint button if puzzle is not solved', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', 'B'],
        [' ', ' '],
        ['A', 'B'],
      ]),
    })
    const r = f.render()
    const btn = r.getByTestId(UseHintFrontend.TEST_ID_USE_HINT_ACTION)[0]
    expect(btn).toBeDefined()
  })
})
