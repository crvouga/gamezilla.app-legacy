import { NonEmpty } from '~/@/array/non-empty'
import { withEventMeta } from '~/@/event-sourced/event'
import { Msg } from '~/@/msg/msg'
import { FixtureSpaceBackend } from '~/app/spaces/@/fixture/backend'
import { FlowBackend } from '../../backend'
import { FlowSpace } from '../../space'
import { ModelSpace } from '../../types'
import { PackDb } from '../pack/pack-db'
import { PuzzleDb } from '../puzzle/puzzle-db'
import type { FlowBackendCtx } from './ctx'

type Input = Parameters<typeof FlowBackend.update>[0]

type Output = Awaited<ReturnType<typeof FlowBackend.update>> & {
  modelSpace: ModelSpace
}

export const FixtureFlowBackend = async () => {
  const f = await FixtureSpaceBackend()
  const ctx: FlowBackendCtx = {
    ...f.ctx,
    packDb: PackDb({ t: 'hash-map' }),
    puzzleDb: PuzzleDb({ t: 'hash-map' }),
  }

  const updates = async (outputs: NonEmpty<Output>, inputs: Input[]): Promise<NonEmpty<Output>> => {
    const [input, ...rest] = inputs
    if (!input) {
      return outputs
    }

    const lastOutput = NonEmpty.last(outputs)
    const lastModelSpace = lastOutput.modelSpace
    const updated = await FlowBackend.update({
      ...f,
      ...input,
      modelSpace: lastModelSpace,
    })
    const newModelSpace = Msg.batch(updated.msgSpace).reduce(
      (modelSpace, msgSpace) => FlowSpace.updateSpace({ ...f, modelSpace, msgSpace: withEventMeta(msgSpace) }),
      lastModelSpace,
    )
    const newOutput: Output = {
      ...updated,
      modelSpace: newModelSpace,
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
