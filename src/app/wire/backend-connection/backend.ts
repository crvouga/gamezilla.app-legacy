import { takeEvery } from 'redux-saga/effects'
import { Posix } from '~/@/time/posix'
import { Topic } from '~/@/topic'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { BackendCtxModule, topicContract } from './types'
import { Sub } from '~/@/sub'

const initCtx = async (input: {
  ctx: AppBackendCtxBase
  topic: Topic.Client<typeof topicContract>
}): Promise<BackendCtxModule> => {
  return {
    ...input.ctx,
    topic: input.topic,
  }
}

const saga = function* (ctx: BackendCtxModule) {
  const pings = Sub.chan(
    ctx.topic['wire.backend-connection.ping-all'].subscribe(null, (msg) => ({
      pingId: msg.pingId,
      now: Posix.now(),
      clientSessionId: msg.clientSessionId,
    })),
  )

  yield takeEvery(pings, function* (ping) {
    ctx.topic['wire.backend-connection.pong'].publish(ping.clientSessionId, {
      pingId: ping.pingId,
    })
  })
}

export const BackendConnectionBackend = {
  initCtx,
  saga,
}
