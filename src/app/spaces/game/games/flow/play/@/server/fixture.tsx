import { NonEmpty } from '~/@/array/non-empty'
import { Msg } from '~/@/msg/msg'
import { FixtureFlowServer } from '../../../@/server/fixture'
import { PlayCore } from '../../core'
import { PlayServer } from '../../server'
import type { ModelCore } from '../../types'

type Input = Partial<Parameters<typeof PlayServer.update>[0]>

type Output = Awaited<ReturnType<typeof PlayServer.update>> & {
  modelCore: ModelCore
}

export const FixtureFlowPlayServer = async () => {
  const f = await FixtureFlowServer()
  const initCore = PlayCore.initCore(f)

  const updates = async (outputs: NonEmpty<Output>, inputs: Input[]): Promise<NonEmpty<Output>> => {
    const [input, ...rest] = inputs
    if (!input) {
      return outputs
    }
    const lastOutput = NonEmpty.last(outputs)
    const nextOutput = await PlayServer.update({ modelCore: lastOutput.modelCore, deps: null, ...f, ...input })
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
