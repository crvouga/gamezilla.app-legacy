import { NonEmpty } from '~/@/array/non-empty'
import { withEventMeta, WithEventMeta } from '~/@/event-sourced/event'
import { FixtureSpacesFrontend } from '~/app/spaces/@/fixture/frontend'
import { FlowFrontend } from '../../frontend'
import { FlowSpace } from '../../space'
import { ModelSpace, MsgFrontend, MsgSpace, MsgToFrontend } from '../../types'
import { PackListTypes } from '../pack/pack-list'
import { PackPuzzlesGridTypes } from '../pack/pack-puzzles-grid'
import { PuzzleListTypes } from '../puzzle/puzzle-list'
import { Solutions } from '../solutions/solutions'
import type { FlowFrontendCtx } from './ctx'
import { PuzzleDb } from '../puzzle/puzzle-db'

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
    puzzleDb: await PuzzleDb({ ...f.ctx, t: 'db-conn-sql' }),
  }
  type Input = {
    ctx?: FlowFrontendCtx | null
    msg?: MsgFrontend | null
    msgBackend?: MsgToFrontend | null
    msgSpace?: WithEventMeta<MsgSpace> | null
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
        msgSpace: input.msgSpace,
        modelSpace: outputs
          .flatMap((o) => o.msgSpace ?? [])
          .reduce(
            (acc, msgSpace): ModelSpace =>
              msgSpace
                ? FlowSpace.updateSpace({
                    ctx: input.ctx ?? ctx,
                    modelSpace: acc,
                    msgSpace: withEventMeta(msgSpace),
                  })
                : acc,
            FlowSpace.initSpace({ ctx: input.ctx ?? ctx }),
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
