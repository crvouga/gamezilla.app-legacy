import { NonEmpty } from '~/@/array/non-empty'
import { withEventMeta, WithEventMeta } from '~/@/event-sourced/event'
import { FixtureSpacesClient } from '~/app/spaces/@/fixture/client'
import { FlowClient } from '../../client'
import { FlowCore } from '../../core'
import { ModelCore, MsgClient, MsgCore, MsgToClient } from '../../types'
import { PackListTypes } from '../pack/pack-list'
import { PackPuzzlesGridTypes } from '../pack/pack-puzzles-grid'
import { PuzzleListTypes } from '../puzzle/puzzle-list'
import { Solutions } from '../solutions/solutions'
import type { FlowClientCtx } from './ctx'

export const FixtureFlowClient = async () => {
  const f = await FixtureSpacesClient()
  const ctx: FlowClientCtx = {
    ...f.ctx,
    packs: {},
    puzzles: {},
    solutions: Solutions.init,
    puzzleList: PuzzleListTypes.initClient,
    packList: PackListTypes.initClient,
    packPuzzleGrid: PackPuzzlesGridTypes.initClient,
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
                    msgCore: withEventMeta(msgCore),
                  })
                : acc,
            FlowCore.initCore({ ctx: input.ctx ?? ctx }),
          ),
        msgCmd: null,
        msgEvt: null,
      })
      outputs.push(output)
    }
    return outputs
  }

  const update = (initial: Output, inputs: Input[]): Output => {
    return NonEmpty.last(updates(initial, inputs))
  }

  const initial = {
    model: FlowClient.init,
  }

  return {
    ...f,
    ctx,
    initial,
    update,
    updates,
  }
}
