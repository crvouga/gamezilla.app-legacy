import { NonEmpty } from '~/@/array/non-empty'
import { PubSub } from '~/@/sub'
import type { WithEventMeta } from '~/@/event-sourced/event'
import { FixtureFlowFrontend } from '../../../@/frontend/fixture'
import { PlayFrontend } from '../../frontend'
import { PlayCore } from '../../core'
import type { ModelCore, MsgFrontend, MsgCore, MsgToFrontend } from '../../types'

export type FixtureUpdateInput = {
  msg?: MsgFrontend
  msgBackend?: MsgToFrontend
  msgCore?: WithEventMeta<MsgCore>
}

export const FixturePlayFrontend = async () => {
  const f = await FixtureFlowFrontend()
  const initCore = PlayCore.initCore(f)

  type Output = ReturnType<typeof PlayFrontend.update> & {
    modelCore: ModelCore
  }

  const render = (output: Output, ctx: typeof f.ctx = f.ctx) => {
    const msgs = PubSub.create<MsgFrontend>()
    const rendered = f.render(
      <PlayFrontend.View ctx={ctx} dispatch={msgs.pub} model={output.model} modelCore={output.modelCore} />,
    )
    return { ...rendered, msgs }
  }

  const updates = (output: Output, inputs: FixtureUpdateInput[]): NonEmpty<Output> => {
    const outputs: NonEmpty<Output> = [output]
    for (const input of inputs) {
      const lastOutput = NonEmpty.last(outputs)
      const nextOutput = PlayFrontend.update({
        ctx: f.ctx,
        model: lastOutput.model,
        modelCore: lastOutput.modelCore,
        ...input,
      })
      const msgCore = [...(input.msgCore ? [input.msgCore] : []), ...(nextOutput.msgCore ?? [])].flat(2)
      const nextModelCore = msgCore.reduce(
        (modelCore, msgCore) =>
          PlayCore.updateCore({
            ctx: f.ctx,
            modelCore,
            msgCore,
          }),
        lastOutput.modelCore,
      )
      outputs.push({
        ...nextOutput,
        modelCore: nextModelCore,
      })
    }
    return outputs
  }

  const update = (output: Output, msgs: FixtureUpdateInput[]): Output => {
    return NonEmpty.last(updates(output, msgs))
  }

  const initial: Output = {
    model: PlayFrontend.init,
    modelCore: initCore,
  }

  return {
    ...f,
    initial,
    render,
    update,
    updates,
  }
}
