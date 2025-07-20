import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { ITopicClient } from '~/@/topic/topic-client/types'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { BackendConnectionFrontend } from './backend-connection/frontend'
import { BackendInstanceFrontend } from './backend-instance/frontend'
import type { FrontendCtxModule, FrontendModule, MsgFrontend, rpcContract, topicContract } from './types'

const initCtx = (input: {
  ctx: AppFrontendCtxBase
  rpc: RPC.Client<typeof rpcContract>
  topic: ITopicClient<typeof topicContract>
}): FrontendCtxModule => {
  return {
    ...input.ctx,
    rpc: input.rpc,
    topic: input.topic,
  }
}

const init: FrontendModule['init'] = (input) => {
  const backendInstance = BackendInstanceFrontend.init({ ctx: input.ctx })
  const backendConnection = BackendConnectionFrontend.init({ ctx: input.ctx })
  return {
    model: {
      backendInstance: backendInstance.model,
      backendConnection: backendConnection.model,
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
    model: input.model.backendInstance,
  })

  const backendConnection = BackendConnectionFrontend.update({
    ...input,
    msg: input.msg?.t === 'got-backend-connection-msg' ? input.msg.c : null,
    ctx: input.ctx,
    model: input.model.backendConnection,
  })

  return {
    model: {
      backendInstance: backendInstance.model,
      backendConnection: backendConnection.model,
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
      BackendInstanceFrontend.subscriptions({ ctx: input.ctx, model: input.model.backendInstance }),
      (c): MsgFrontend => ({ t: 'got-backend-instance-msg', c }),
    ),
    Sub.map(
      BackendConnectionFrontend.subscriptions({ ctx: input.ctx, model: input.model.backendConnection }),
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
