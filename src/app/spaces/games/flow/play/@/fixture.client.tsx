import { NonEmpty } from '~/@/array/non-empty'
import { PubSub } from '~/@/sub'
import type { WithEventMeta } from '~/@/event-sourced/event'
import { FixtureFlowClient } from '../../@/client/fixture'
import { PlayClient } from '../client'
import { PlayCore } from '../core'
import type { ModelCore, MsgClient, MsgCore, MsgToClient } from '../types'

export type FixtureUpdateInput = {
  msg?: MsgClient
  msgServer?: MsgToClient
  msgCore?: WithEventMeta<MsgCore>
}

export const FixtureFlowPlayClient = async () => {
  const f = await FixtureFlowClient()
  const initCore = PlayCore.initCore(f)

  type Output = ReturnType<typeof PlayClient.update> & {
    modelCore: ModelCore
  }

  const render = (output: Output, ctx: typeof f.ctx = f.ctx) => {
    const msgs = PubSub.create<MsgClient>()
    const rendered = f.render(
      <PlayClient.View ctx={ctx} dispatch={msgs.pub} model={output.model} modelCore={output.modelCore} />
    )
    return { ...rendered, msgs }
  }

  const updates = (output: Output, inputs: FixtureUpdateInput[]): NonEmpty<Output> => {
    const outputs: NonEmpty<Output> = [output]
    for (const input of inputs) {
      const lastOutput = NonEmpty.last(outputs)
      const nextOutput = PlayClient.update({
        ctx: f.ctx,
        model: lastOutput.model,
        modelCore: lastOutput.modelCore,
        ...input
      })
      const msgCore = [...(input.msgCore ? [input.msgCore] : []), ...(nextOutput.msgCore ?? [])].flat(2)
      const nextModelCore = msgCore.reduce(
        (modelCore, msgCore) =>
          PlayCore.updateCore({
            ctx: f.ctx,
            modelCore,
            msgCore
          }),
        lastOutput.modelCore
      )
      outputs.push({
        ...nextOutput,
        modelCore: nextModelCore
      })
    }
    return outputs
  }

  const update = (output: Output, msgs: FixtureUpdateInput[]): Output => {
    return NonEmpty.last(updates(output, msgs))
  }

  const initial: Output = {
    model: PlayClient.init,
    modelCore: initCore
  }

  return {
    ...f,
    initial,
    render,
    update,
    updates
  }
}
