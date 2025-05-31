import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { BackendConnectionFrontend } from './backend-connection/frontend'
import { BackendInstanceFrontend } from './backend-instance/frontend'
import type { FrontendModule, ModelFrontend, MsgFrontend } from './types'

const init: FrontendModule['init'] = (input) => {
  const backendInstance = BackendInstanceFrontend.init({
    ctx: { ...input.ctx, rpc: input.ctx.rpc.backendInstance },
  })
  const backendConnection = BackendConnectionFrontend.init({
    ctx: { ...input.ctx, topic: input.ctx.topic.backendConnection },
  })
  return {
    model: {
      backendInstance: backendInstance.model,
      backendConnection: backendConnection.model,
    },
  }
}

const update: FrontendModule['update'] = (input) => {
  const backendInstance = BackendInstanceFrontend.update({
    ...input,
    msg: input.msg?.t === 'got-backend-instance-msg' ? input.msg.c : null,
    ctx: { ...input.ctx, rpc: input.ctx.rpc.backendInstance },
    model: input.model.backendInstance,
  })

  const backendConnection = BackendConnectionFrontend.update({
    ...input,
    msg: input.msg?.t === 'got-backend-connection-msg' ? input.msg.c : null,
    ctx: { ...input.ctx, topic: input.ctx.topic.backendConnection },
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
    Sub.tag(
      'got-backend-instance-msg',
      BackendInstanceFrontend.subscriptions({
        ctx: { ...input.ctx, rpc: input.ctx.rpc.backendInstance },
        model: input.model.backendInstance,
      }),
    ),
    Sub.tag(
      'got-backend-connection-msg',
      BackendConnectionFrontend.subscriptions({
        ctx: { ...input.ctx, topic: input.ctx.topic.backendConnection },
        model: input.model.backendConnection,
      }),
    ),
  ])
}

const ViewDot = (input: { model: ModelFrontend; ctx: AppFrontendCtxBase; className: string }) => {
  return (
    <BackendConnectionFrontend.ViewDot
      model={input.model.backendConnection}
      ctx={input.ctx}
      className={input.className}
    />
  )
}

const ViewListItem = (input: {
  model: ModelFrontend
  ctx: AppFrontendCtxBase
  dispatch: (msg: MsgFrontend) => void
}) => {
  return (
    <BackendConnectionFrontend.ViewListItem
      model={input.model.backendConnection}
      ctx={input.ctx}
      dispatch={(c) => input.dispatch({ t: 'got-backend-connection-msg', c })}
    />
  )
}

export const WireFrontend = {
  init,
  update,
  subscriptions,
  ViewDot,
  ViewListItem,
}
