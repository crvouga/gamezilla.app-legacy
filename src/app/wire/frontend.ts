import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { BackendConnectionFrontend } from './backend-connection/frontend'
import { BackendInstanceFrontend } from './backend-instance/frontend'
import type { FrontendCtxModule, FrontendModule, MsgFrontend, topicContract } from './types'

const initCtx = (input: { ctx: AppFrontendCtxBase; topic: ITopicClient<typeof topicContract> }): FrontendCtxModule => {
  return {
    ...input.ctx,
    topic: input.topic,
  }
}

const init: FrontendModule['init'] = (input) => {
  const backendInstance = BackendInstanceFrontend.init({ ctx: input.ctx })
  const backendConnection = BackendConnectionFrontend.init({ ctx: input.ctx })
  return {
    model: {
      wire_backendInstance: backendInstance.model,
      wire_backendConnection: backendConnection.model,
    },
    eff: Eff.batch<MsgFrontend>(
      Eff.tag('got-backend-instance-msg', backendInstance.eff),
      Eff.tag('got-backend-connection-msg', backendConnection.eff),
    ),
    msgOut: Msg.batch([backendInstance.msgOut, backendConnection.msgOut]),
  }
}

const update: FrontendModule['update'] = (input) => {
  const backendInstance = BackendInstanceFrontend.update({
    ...input,
    msg: input.msg?.t === 'got-backend-instance-msg' ? input.msg.c : null,
    ctx: input.ctx,
    model: input.model.wire_backendInstance,
  })

  const backendConnection = BackendConnectionFrontend.update({
    ...input,
    msg: input.msg?.t === 'got-backend-connection-msg' ? input.msg.c : null,
    ctx: input.ctx,
    model: input.model.wire_backendConnection,
  })

  return {
    model: {
      wire_backendInstance: backendInstance.model,
      wire_backendConnection: backendConnection.model,
    },
    eff: Eff.batch<MsgFrontend>(
      Eff.tag('got-backend-instance-msg', backendInstance.eff),
      Eff.tag('got-backend-connection-msg', backendConnection.eff),
    ),
    msgOut: Msg.batch([backendInstance.msgOut, backendConnection.msgOut]),
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch<MsgFrontend>([
    Sub.map(
      BackendInstanceFrontend.subscriptions({ ctx: input.ctx, model: input.model.wire_backendInstance }),
      (c): MsgFrontend => ({ t: 'got-backend-instance-msg', c }),
    ),
    Sub.map(
      BackendConnectionFrontend.subscriptions({ ctx: input.ctx, model: input.model.wire_backendConnection }),
      (c): MsgFrontend => ({ t: 'got-backend-connection-msg', c }),
    ),
  ])
}

export const WireFrontend = {
  initCtx,
  init,
  update,
  subscriptions,
}
