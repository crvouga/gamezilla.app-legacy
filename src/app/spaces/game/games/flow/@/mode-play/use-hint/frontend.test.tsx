import { describe, expect, it } from 'bun:test'
import { VariantGridShorthand } from '../../variant/grid'
import { FixtureModePlayUseHint } from './fixture'
import { UseHintFrontend } from './frontend'

const Fixture = FixtureModePlayUseHint

describe(import.meta.file, () => {
  it('should disable hint button if puzzle is solved', async () => {
    const f = await Fixture({
      ctxFlow: VariantGridShorthand.toGrid([
        ['A', 'B'],
        ['a', 'b'],
        ['A', 'B'],
      ]),
    })
    const viewed = UseHintFrontend.viewUseHintAction({
      ctx: f.ctx,
      dispatch: () => {},
      model: f.init,
      disabled: true,
    })
    expect(viewed.disabled).toBe(true)
  })
})
