import { Msg } from '~/@/msg/msg'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { Topic } from '~/@/topic'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { BackendConnectionBackend } from './backend-connection/backend'
import { BackendInstanceBackend } from './backend-instance/backend'
import { BackendModule, MsgBackend, rpcContract, topicContract, type BackendCtxModule } from './types'

const initCtx = async (input: {
  ctx: AppBackendCtxBase
  topic: Topic.Client<typeof topicContract>
}): Promise<BackendCtxModule> => {
  return {
    ...input.ctx,
    backendInstance: await BackendInstanceBackend.initCtx({ ctx: input.ctx }),
    backendConnection: { ...input.ctx, topic: input.topic.backendConnection },
  }
}

const update: BackendModule['update'] = async (input) => {
  const backendInstance = await BackendInstanceBackend.update({
    ctx: input.ctx.backendInstance,
    msg: input.msg?.t === 'got-backend-instance-msg' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const backendConnection = await BackendConnectionBackend.update({
    ctx: input.ctx.backendConnection,
    msg: input.msg?.t === 'got-backend-connection-msg' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  return {
    msgOut: Msg.batch(backendInstance.msgOut, backendConnection.msgOut),
  }
}

const subscriptions: BackendModule['subscriptions'] = async (input) => {
  return Sub.batch<MsgBackend>([
    Sub.tag('got-backend-instance-msg', await BackendInstanceBackend.subscriptions({ ctx: input.ctx.backendInstance })),
    Sub.tag(
      'got-backend-connection-msg',
      await BackendConnectionBackend.subscriptions({ ctx: input.ctx.backendConnection }),
    ),
  ])
}

const rpc = (input: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    backendInstance: BackendInstanceBackend.rpc({ ctx: input.ctx.backendInstance }),
  })
}

export const WireBackend = {
  initCtx,
  update,
  subscriptions,
  rpc,
}
