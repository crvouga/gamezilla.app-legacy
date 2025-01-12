import { NonEmpty } from '~/@/array/non-empty'
import { withEventMeta } from '~/@/event-sourced/event'
import { Msg } from '~/@/msg/msg'
import { FixtureSpaceBackend } from '~/app/spaces/@/fixture/backend'
import { FlowCore } from '../../core'
import { FlowBackend } from '../../backend'
import { ModelCore } from '../../types'
import { PackDb } from '../pack/pack-db'
import { PuzzleDb } from '../puzzle/puzzle-db'
import { Solutions } from '../solutions/solutions'
import type { FlowBackendCtx } from './ctx'

type Input = Parameters<typeof FlowBackend.update>[0]

type Output = Awaited<ReturnType<typeof FlowBackend.update>> & {
  modelCore: ModelCore
}

export const FixtureFlowBackend = async () => {
  const f = await FixtureSpaceBackend()
  const ctx: FlowBackendCtx = {
    ...f.ctx,
    solutions: Solutions.init,
    packDb: PackDb({ t: 'hash-map' }),
    puzzleDb: PuzzleDb({ t: 'hash-map' }),
  }

  const updates = async (outputs: NonEmpty<Output>, inputs: Input[]): Promise<NonEmpty<Output>> => {
    const [input, ...rest] = inputs
    if (!input) {
      return outputs
    }

    const lastOutput = NonEmpty.last(outputs)
    const lastModelCore = lastOutput.modelCore
    const updated = await FlowBackend.update({
      ...f,
      ...input,
      modelCore: lastModelCore,
    })
    const newModelCore = Msg.batch(updated.msgCore).reduce(
      (modelCore, msgCore) => FlowCore.updateCore({ ...f, modelCore, msgCore: withEventMeta(msgCore) }),
      lastModelCore,
    )
    const newOutput: Output = {
      ...updated,
      modelCore: newModelCore,
    }
    return updates([...outputs, newOutput], rest)
  }

  const update = async (output: Output, inputs: Input[]): Promise<Output> => {
    return NonEmpty.last(await updates([output], inputs))
  }

  const initial = {
    model: FlowBackend.init,
  }

  return {
    ...f,
    ctx,
    initial,
    update,
    updates,
  }
}
