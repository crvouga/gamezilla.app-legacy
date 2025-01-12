import { NonEmpty } from '~/@/array/non-empty'
import { withEventMeta, WithEventMeta } from '~/@/event-sourced/event'
import { FixtureSpacesFrontend } from '~/app/spaces/@/fixture/frontend'
import { FlowFrontend } from '../../frontend'
import { FlowCore } from '../../core'
import { ModelCore, MsgFrontend, MsgCore, MsgToFrontend } from '../../types'
import { PackListTypes } from '../pack/pack-list'
import { PackPuzzlesGridTypes } from '../pack/pack-puzzles-grid'
import { PuzzleListTypes } from '../puzzle/puzzle-list'
import { Solutions } from '../solutions/solutions'
import type { FlowFrontendCtx } from './ctx'

export const FixtureFlowFrontend = async () => {
  const f = await FixtureSpacesFrontend()
  const ctx: FlowFrontendCtx = {
    ...f.ctx,
    packs: {},
    puzzles: {},
    solutions: Solutions.init,
    puzzleList: PuzzleListTypes.initFrontend,
    packList: PackListTypes.initFrontend,
    packPuzzleGrid: PackPuzzlesGridTypes.initFrontend,
  }
  type Input = {
    ctx?: FlowFrontendCtx | null
    msg?: MsgFrontend | null
    msgBackend?: MsgToFrontend | null
    msgCore?: WithEventMeta<MsgCore> | null
  }

  type Output = ReturnType<typeof FlowFrontend.update>

  const updates = (initial: Output, inputs: Input[]): NonEmpty<Output> => {
    const outputs: NonEmpty<Output> = [initial]
    for (const input of inputs) {
      const lastOutput = NonEmpty.last(outputs)

      const output = FlowFrontend.update({
        ctx: input.ctx ?? ctx,
        model: lastOutput.model,
        msg: input.msg,
        msgBackend: input.msgBackend,
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
    model: FlowFrontend.init,
  }

  return {
    ...f,
    ctx,
    initial,
    update,
    updates,
  }
}
