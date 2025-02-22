import { NonEmpty } from '~/@/array/non-empty'
import { withEventMeta, WithEventMeta } from '~/@/event-sourced/event'
import { FixtureSpacesFrontend } from '~/app/spaces/@/fixture/frontend'
import { FlowFrontend } from '../../frontend'
import { FlowSpace } from '../../space'
import { ModelSpace, MsgFrontend, MsgSpace, MsgToFrontend } from '../../types'
import { PackDb } from '../pack/pack-db'
import { PackLoaderTypes } from '../pack/pack-loader'
import { PuzzleDb } from '../puzzle/puzzle-db'
import { PuzzleLoaderTypes } from '../puzzle/puzzle-loader'
import { SolutionsDb } from '../solutions/solutions-db/impl'
import { SolutionsFinderTypes } from '../solutions/solutions-finder'
import type { FlowFrontendCtx } from './ctx'

export const FixtureFlowFrontend = async () => {
  const f = await FixtureSpacesFrontend()
  const ctx: FlowFrontendCtx = {
    ...f.ctx,
    packs: {},
    puzzles: {},
    solutions: {},
    puzzleLoader: PuzzleLoaderTypes.initFrontend,
    packLoader: PackLoaderTypes.initFrontend,
    solutionsFinder: SolutionsFinderTypes.initFrontend,
    puzzleDb: PuzzleDb({ ...f.ctx, t: 'db-conn-sql' }),
    packDb: PackDb({ ...f.ctx, t: 'db-conn-sql' }),
    solutionsDb: SolutionsDb({ t: 'db-conn-sql', dbConnSql: f.ctx.dbConnSql }),
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
