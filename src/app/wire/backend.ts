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
    ...(await BackendInstanceBackend.initCtx(input)),
    ...(await BackendConnectionBackend.initCtx(input)),
  }
}

const rpc = (input: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    ...BackendInstanceBackend.rpc({ ctx: input.ctx }),
  })
}

const saga = function* (input: { ctx: BackendCtxModule }) {
  yield fork(BackendConnectionBackend.saga, input)
  yield fork(BackendInstanceBackend.saga, input)
}

export const WireBackend = {
  initCtx,
  rpc,
  saga,
}
