import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { andThen } from '../@/frontend/and-then'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { BackendConnectionFrontend } from './backend-connection/frontend'
import { BackendInstanceFrontend } from './backend-instance/frontend'
import type { FrontendCtxModule, ModelFrontend, MsgFrontend, topicContract } from './types'

const initCtx = (input: { ctx: AppFrontendCtxBase; topic: ITopicClient<typeof topicContract> }): FrontendCtxModule => {
  return {
    ...input.ctx,
    topic: input.topic,
  }
}

const update = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  return andThen<T, MsgFrontend>(
    input,
    (model) => BackendInstanceFrontend.update({ ...input, model }),
    (model) => BackendConnectionFrontend.update({ ...input, model }),
  )
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  return Sub.batch<MsgFrontend>([
    BackendInstanceFrontend.subscriptions(input),
    BackendConnectionFrontend.subscriptions(input),
  ])
}

export const WireFrontend = {
  initCtx,
  update,
  subscriptions,
}
