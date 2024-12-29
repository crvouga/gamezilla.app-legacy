import { NonEmpty } from '~/@/core'
import { Msg } from '~/@/core/msg'
import { withEventMeta } from '~/@/event-sourced/event'
import { FixtureSpaceServer } from '~/app/spaces/@/fixture/server'
import { FlowCore } from '../../core'
import { FlowServer } from '../../server'
import { ModelCore } from '../../types'
import type { FlowServerCtx } from './ctx'
import { PackDb } from '../pack/pack-db'
import { PuzzleDb } from '../puzzle/puzzle-db'

type Input = Parameters<typeof FlowServer.update>[0]

type Output = Awaited<ReturnType<typeof FlowServer.update>> & {
  modelCore: ModelCore
}

export const FixtureFlowServer = async () => {
  const f = await FixtureSpaceServer()
  const ctx: FlowServerCtx = {
    ...f.ctx,

    flowPackDb: PackDb({ t: 'hash-map' }),
    flowPuzzleDb: PuzzleDb({ t: 'hash-map' })
  }

  const updates = async (outputs: NonEmpty<Output>, inputs: Input[]): Promise<NonEmpty<Output>> => {
    const [input, ...rest] = inputs
    if (!input) {
      return outputs
    }

    const lastOutput = NonEmpty.last(outputs)
    const lastModelCore = lastOutput.modelCore
    const updated = await FlowServer.update({
      ...f,
      ...input,
      modelCore: lastModelCore
    })
    const newModelCore = Msg.batch(updated.msgCore).reduce(
      (modelCore, msgCore) => FlowCore.updateCore({ ...f, modelCore, msgCore: withEventMeta(msgCore) }),
      lastModelCore
    )
    const newOutput: Output = {
      ...updated,
      modelCore: newModelCore
    }
    return updates([...outputs, newOutput], rest)
  }

  const update = async (output: Output, inputs: Input[]): Promise<Output> => {
    return NonEmpty.last(await updates([output], inputs))
  }

  const initial = {
    model: FlowServer.init
  }

  return {
    ...f,
    ctx,
    initial,
    update,
    updates
  }
}
