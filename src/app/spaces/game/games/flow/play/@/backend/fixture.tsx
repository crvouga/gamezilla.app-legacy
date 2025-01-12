import { NonEmpty } from '~/@/array/non-empty'
import { Msg } from '~/@/msg/msg'
import { FixtureFlowBackend } from '../../../@/backend/fixture'
import { PlayCore } from '../../core'
import { PlayBackend } from '../../backend'
import type { ModelCore } from '../../types'

type Input = Partial<Parameters<typeof PlayBackend.update>[0]>

type Output = Awaited<ReturnType<typeof PlayBackend.update>> & {
  modelCore: ModelCore
}

export const FixturePlayBackend = async () => {
  const f = await FixtureFlowBackend()
  const initCore = PlayCore.initCore(f)

  const updates = async (outputs: NonEmpty<Output>, inputs: Input[]): Promise<NonEmpty<Output>> => {
    const [input, ...rest] = inputs
    if (!input) {
      return outputs
    }
    const lastOutput = NonEmpty.last(outputs)
    const nextOutput = await PlayBackend.update({ modelCore: lastOutput.modelCore, deps: null, ...f, ...input })
    const msgCore = Msg.batch(input.msgCore, nextOutput.msgCore)
    const nextModelCore = msgCore.reduce(
      (modelCore, msgCore) => PlayCore.updateCore({ ctx: f.ctx, modelCore, msgCore }),
      lastOutput.modelCore,
    )
    const output = {
      ...nextOutput,
      modelCore: nextModelCore,
    }
    return updates([...outputs, output], rest)
  }

  const update = async (output: Output, input: Input[]): Promise<Output> => {
    return NonEmpty.last(await updates([output], input))
  }

  const initial: Output = {
    modelCore: initCore,
  }

  return {
    ...f,
    initial,
    update,
    updates,
  }
}
