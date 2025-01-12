import { NonEmpty } from '~/@/array/non-empty'
import { Msg } from '~/@/msg/msg'
import { FixtureFlowBackend } from '../../../@/backend/fixture'
import { PlaySpace } from '../../space'
import { PlayBackend } from '../../backend'
import type { ModelSpace } from '../../types'

type Input = Partial<Parameters<typeof PlayBackend.update>[0]>

type Output = Awaited<ReturnType<typeof PlayBackend.update>> & {
  modelSpace: ModelSpace
}

export const FixturePlayBackend = async () => {
  const f = await FixtureFlowBackend()
  const initSpace = PlaySpace.initSpace(f)

  const updates = async (outputs: NonEmpty<Output>, inputs: Input[]): Promise<NonEmpty<Output>> => {
    const [input, ...rest] = inputs
    if (!input) {
      return outputs
    }
    const lastOutput = NonEmpty.last(outputs)
    const nextOutput = await PlayBackend.update({ modelSpace: lastOutput.modelSpace, deps: null, ...f, ...input })
    const msgSpace = Msg.batch(input.msgSpace, nextOutput.msgSpace)
    const nextModelSpace = msgSpace.reduce(
      (modelSpace, msgSpace) => PlaySpace.updateSpace({ ctx: f.ctx, modelSpace, msgSpace }),
      lastOutput.modelSpace,
    )
    const output = {
      ...nextOutput,
      modelSpace: nextModelSpace,
    }
    return updates([...outputs, output], rest)
  }

  const update = async (output: Output, input: Input[]): Promise<Output> => {
    return NonEmpty.last(await updates([output], input))
  }

  const initial: Output = {
    modelSpace: initSpace,
  }

  return {
    ...f,
    initial,
    update,
    updates,
  }
}
