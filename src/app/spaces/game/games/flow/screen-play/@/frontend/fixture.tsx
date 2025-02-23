import { NonEmpty } from '~/@/array/non-empty'
import type { WithEventMeta } from '~/@/event-sourced/event'
import { PubSub } from '~/@/sub'
import { FixtureFlowFrontend } from '../../../@/frontend/fixture'
import { ScreenPlayFrontend } from '../../frontend'
import { PlaySpace } from '../../space'
import type { ModelSpace, MsgFrontend, MsgSpace, MsgToFrontend } from '../../types'

export type FixtureUpdateInput = {
  msg?: MsgFrontend
  msgBackend?: MsgToFrontend
  msgSpace?: WithEventMeta<MsgSpace>
}

export const FixturePlayFrontend = async () => {
  const f = await FixtureFlowFrontend()
  const initSpace = PlaySpace.initSpace(f)

  type Output = ReturnType<typeof ScreenPlayFrontend.update> & {
    modelSpace: ModelSpace
  }

  const render = (output: Output, ctx: typeof f.ctx = f.ctx) => {
    const msgs = PubSub.create<MsgFrontend>()
    const rendered = f.render(
      <ScreenPlayFrontend.View ctx={ctx} dispatch={msgs.pub} model={output.model} modelSpace={output.modelSpace} />,
    )
    return { ...rendered, msgs }
  }

  const updates = (output: Output, inputs: FixtureUpdateInput[]): NonEmpty<Output> => {
    const outputs: NonEmpty<Output> = [output]
    for (const input of inputs) {
      const lastOutput = NonEmpty.last(outputs)
      const nextOutput = ScreenPlayFrontend.update({
        ctx: f.ctx,
        model: lastOutput.model,
        modelSpace: lastOutput.modelSpace,
        ...input,
      })
      const msgSpace = [...(input.msgSpace ? [input.msgSpace] : []), ...(nextOutput.msgSpace ?? [])].flat(2)
      const nextModelSpace = msgSpace.reduce(
        (modelSpace, msgSpace) => PlaySpace.updateSpace({ ctx: f.ctx, modelSpace, msgSpace }),
        lastOutput.modelSpace,
      )
      outputs.push({
        ...nextOutput,
        modelSpace: nextModelSpace,
      })
    }
    return outputs
  }

  const update = (output: Output, msgs: FixtureUpdateInput[]): Output => {
    return NonEmpty.last(updates(output, msgs))
  }

  const initial: Output = {
    model: ScreenPlayFrontend.init,
    modelSpace: initSpace,
  }

  return {
    ...f,
    initial,
    render,
    update,
    updates,
  }
}
