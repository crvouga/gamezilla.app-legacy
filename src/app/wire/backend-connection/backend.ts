import { Sub } from '~/@/sub'
import { UnixMs } from '~/@/time/unix-ms'
import { ITopicClient } from '~/@/topic/topic-client/types'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { BackendCtxModule, topicContract } from './types'

const initCtx = async (input: {
  ctx: AppBackendCtxBase
  topic: ITopicClient<typeof topicContract>
}): Promise<BackendCtxModule> => {
  return {
    ...input.ctx,
    topic: input.topic,
  }
}

const worker = async (s: AbortSignal, input: { ctx: BackendCtxModule }) => {
  const pings = input.ctx.topic.ping.subAll((msg) => ({
    pingId: msg.pingId,
    now: UnixMs.now(),
    clientSessionId: msg.clientSessionId,
  }))

  Sub.takeEvery(s, pings, (ping) => {
    input.ctx.topic.pong.pub(ping.clientSessionId, {
      pingId: ping.pingId,
    })
  })
}

export const BackendConnectionBackend = {
  initCtx,
  worker,
}
