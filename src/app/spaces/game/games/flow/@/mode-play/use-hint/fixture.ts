import { UseHint } from '.'
import { FixtureFlowFrontend } from '../../frontend/fixture'
import { Variant } from '../../variant'
import { VariantGridShorthand } from '../../variant/grid'

type Input = {
  msg: UseHint.Msg
  ctx?: UseHint.Ctx
}

export const FixtureModePlayUseHint = async (input?: { ctxFlow?: Variant.Model }) => {
  const f = await FixtureFlowFrontend()

  const ctxFlow =
    input?.ctxFlow ??
    VariantGridShorthand.toGrid([
      ['A', ' '],
      [' ', 'A'],
    ])

  const ctx = UseHint.initCtx({
    flow: ctxFlow,
  })

  const update = (init: UseHint.Model, inputs: Input[]): ReturnType<typeof UseHint.update> => {
    let output: ReturnType<typeof UseHint.update> = {
      model: init,
    }
    for (const input of inputs) {
      output = UseHint.update({
        ctx: UseHint.initCtx(input.ctx ?? ctx),
        model: output.model,
        msg: input.msg,
      })
    }
    return output
  }

  const init: UseHint.Model = UseHint.init({ ctx })

  return {
    ...f,
    ctx: {
      ...f.ctx,
      ...ctx,
    },
    update,
    init,
  }
}
