import { fork } from 'redux-saga/effects'
import { RPC } from '~/@/rpc'
import { Topic } from '~/@/topic'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { BackendConnectionBackend } from './backend-connection/backend'
import { BackendInstanceBackend } from './backend-instance/backend'
import { rpcContract, topicContract, type BackendCtxModule } from './types'

const initCtx = async (input: {
  ctx: AppBackendCtxBase
  topic: Topic.Client<typeof topicContract>
}): Promise<BackendCtxModule> => {
  return {
    ...input.ctx,
    backendInstance: await BackendInstanceBackend.initCtx({ ctx: input.ctx }),
    backendConnection: await BackendConnectionBackend.initCtx({ ctx: input.ctx, topic: input.topic }),
  }
}

const rpc = (ctx: BackendCtxModule) => {
  return RPC.initServer(rpcContract, {
    ...BackendInstanceBackend.rpc({ ctx: ctx.backendInstance }),
  })
}

const saga = function* (ctx: BackendCtxModule) {
  yield fork(BackendConnectionBackend.saga, ctx.backendConnection)
  yield fork(BackendInstanceBackend.saga, ctx.backendInstance)
}

export const WireBackend = {
  initCtx,
  rpc,
  saga,
}
