import { RPC } from '~/@/rpc'
import { ITopicClient } from '~/@/topic/topic-client/types'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { BackendConnectionBackend } from './backend-connection/backend'
import { BackendInstanceBackend } from './backend-instance/backend'
import { rpcContract, topicContract, type BackendCtxModule } from './types'

const initCtx = async (input: {
  ctx: AppBackendCtxBase
  topic: ITopicClient<typeof topicContract>
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

const worker = async (s: AbortSignal, input: { ctx: BackendCtxModule }) => {
  BackendInstanceBackend.worker(s, input)
  BackendConnectionBackend.worker(s, input)
}

export const WireBackend = {
  initCtx,
  rpc,
  worker,
}
