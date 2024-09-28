import { NonEmpty } from 'gamezilla-app/@/core'
import { withEventMeta, WithEventMeta } from 'gamezilla-app/app/spaces/@/event'
import { FixtureSpaceClient } from 'gamezilla-app/app/spaces/@/fixture/client'
import { FlowClient } from '../flow.client'
import { FlowCore } from '../flow.core'
import { ModelCore, MsgClient, MsgCore, MsgToClient } from '../flow.types'
import type { FlowClientCtx } from './flow-client-ctx'
import { FlowPackListTypes } from './flow-pack'
import { FlowPackPuzzlesGridTypes } from './flow-pack/flow-pack-puzzles-grid'
import { FlowPuzzleListTypes } from './flow-puzzle'

export const FixtureFlowClient = async () => {
  const f = await FixtureSpaceClient()
  const ctx: FlowClientCtx = {
    ...f.ctx,
    flowPacks: {},
    flowPuzzles: {},
    flowPuzzleList: FlowPuzzleListTypes.initClient,
    flowPackList: FlowPackListTypes.initClient,
    flowPackPuzzleGrid: FlowPackPuzzlesGridTypes.initClient
  }
  type Input = {
    ctx?: FlowClientCtx | null
    msg?: MsgClient | null
    msgServer?: MsgToClient | null
    msgCore?: WithEventMeta<MsgCore> | null
  }

  type Output = ReturnType<typeof FlowClient.update>

  const updates = (initial: Output, inputs: Input[]): NonEmpty<Output> => {
    const outputs: NonEmpty<Output> = [initial]
    for (const input of inputs) {
      const lastOutput = NonEmpty.last(outputs)

      const output = FlowClient.update({
        ctx: input.ctx ?? ctx,
        model: lastOutput.model,
        msg: input.msg,
        msgServer: input.msgServer,
        msgCore: input.msgCore,
        modelCore: outputs
          .flatMap((o) => o.msgCore ?? [])
          .reduce(
            (acc, msgCore): ModelCore =>
              msgCore
                ? FlowCore.updateCore({
                    ctx: input.ctx ?? ctx,
                    modelCore: acc,
                    msgCore: withEventMeta(msgCore)
                  })
                : acc,
            FlowCore.initCore({ ctx: input.ctx ?? ctx })
          ),
        msgCmd: null,
        msgEvt: null
      })
      outputs.push(output)
    }
    return outputs
  }

  const update = (initial: Output, inputs: Input[]): Output => {
    return NonEmpty.last(updates(initial, inputs))
  }

  const initial = {
    model: FlowClient.init
  }

  return {
    ...f,
    ctx,
    initial,
    update,
    updates
  }
}
