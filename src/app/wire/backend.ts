import { ITopicClient } from '~/@/topic/topic-client/interface'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { BackendConnectionBackend } from './backend-connection/backend'
import { BackendInstanceBackend } from './backend-instance/backend'
import { topicContract, type BackendCtxModule } from './types'

const initCtx = async (input: {
  ctx: AppBackendCtxBase
  topic: ITopicClient<typeof topicContract>
}): Promise<BackendCtxModule> => {
  return {
    ...input.ctx,
    ...(await BackendInstanceBackend.initCtx(input)),
    topic: input.topic,
  }
}

const worker = async (s: AbortSignal, input: { ctx: BackendCtxModule }) => {
  BackendInstanceBackend.worker(s, input)
  BackendConnectionBackend.worker(s, { topic: input.ctx.topic })
}

export const WireBackend = {
  initCtx,
  worker,
}
