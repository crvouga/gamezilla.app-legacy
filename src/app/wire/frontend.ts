import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { BackendConnectionFrontend } from './backend-connection'
import { BackendInstanceFrontend } from './backend-instance'
import type { FrontendCtxModule, ModelFrontend, MsgFrontend, topicContract } from './types'

const initCtx = (input: { ctx: AppFrontendCtxBase; topic: ITopicClient<typeof topicContract> }): FrontendCtxModule => {
  return {
    ...input.ctx,
    topic: input.topic,
  }
}

const init = (input: { ctx: FrontendCtxModule }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  const backendInstance = BackendInstanceFrontend.init(input)
  const backendConnection = BackendConnectionFrontend.init(input)
  return {
    model: {
      backendInstance: backendInstance.model,
      backendConnection: backendConnection.model,
    },
    eff: Eff.batch<MsgFrontend>([
      Eff.tag('backendInstance', backendInstance.eff),
      Eff.tag('backendConnection', backendConnection.eff),
    ]),
  }
}

const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: MsgFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  switch (input.msg.t) {
    case 'backendInstance': {
      const updated = BackendInstanceFrontend.update({
        ...input,
        model: input.model.backendInstance,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, backendInstance: updated.model },
        eff: Eff.tag('backendInstance', updated.eff),
      }
    }
    case 'backendConnection': {
      const updated = BackendConnectionFrontend.update({
        ...input,
        model: input.model.backendConnection,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, backendConnection: updated.model },
        eff: Eff.tag('backendConnection', updated.eff),
      }
    }
  }
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  return Sub.batch<MsgFrontend>([
    Sub.map(
      BackendInstanceFrontend.subscriptions({ ctx: input.ctx, model: input.model.backendInstance }),
      (c): MsgFrontend => ({
        t: 'backendInstance',
        c,
      }),
    ),
    Sub.map(
      BackendConnectionFrontend.subscriptions({ ctx: input.ctx, model: input.model.backendConnection }),
      (c): MsgFrontend => ({
        t: 'backendConnection',
        c,
      }),
    ),
  ])
}

export const WireFrontend = {
  init,
  initCtx,
  update,
  subscriptions,
}
