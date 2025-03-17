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
    const viewed = UseHintFrontend.viewAction({
      ctx: f.ctx,
      dispatch: () => {},
      model: f.init,
      hidden: false,
      disabled: true,
    })
    expect(viewed[0]?.disabled ?? true).toBe(true)
  })
})
