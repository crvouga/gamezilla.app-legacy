import { NonEmpty } from 'gamezilla-app/@/core'
import { withEventMeta, WithEventMeta } from 'gamezilla-app/@/event-sourced/event'
import { FixtureSpaceClient } from 'gamezilla-app/app/spaces/@/fixture/client'
import { FlowClient } from '../client'
import { FlowCore } from '../core'
import { ModelCore, MsgClient, MsgCore, MsgToClient } from '../types'
import type { FlowClientCtx } from './flow-client-ctx'
import { FlowPackListTypes } from './pack/pack-list'
import { FlowPackPuzzlesGridTypes } from './pack/pack-puzzles-grid'
import { FlowPuzzleListTypes } from './puzzle/puzzle-list'

export const FixtureFlowClient = async () => {
  const f = await FixtureSpaceClient()
  const ctx: FlowClientCtx = {
    ...f.ctx,
    packs: {},
    puzzles: {},
    puzzleList: FlowPuzzleListTypes.initClient,
    packList: FlowPackListTypes.initClient,
    packPuzzleGrid: FlowPackPuzzlesGridTypes.initClient
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
