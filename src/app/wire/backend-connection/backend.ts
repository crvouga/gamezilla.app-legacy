import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { Topic } from '~/@/topic'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { BackendCtxModule, topicContract } from './types'

const initCtx = async (input: {
  ctx: AppBackendCtxBase
  topic: Topic.Client<typeof topicContract>
}): Promise<BackendCtxModule> => {
  return {
    ...input.ctx,
    topic: input.topic,
  }
}

const worker = async (s: AbortSignal, input: { ctx: BackendCtxModule }) => {
  const pings = input.ctx.topic.ping.subAll((msg) => ({
    pingId: msg.pingId,
    now: Posix.now(),
    clientSessionId: msg.clientSessionId,
  }))

  Sub.takeEvery(s, pings, (ping) => {
    input.ctx.topic.pong.pub(ping.clientSessionId, ping)
  })
}

export const BackendConnectionBackend = {
  initCtx,
  worker,
}
