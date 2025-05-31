import { takeEvery } from 'redux-saga/effects'
import { Posix } from '~/@/time/posix'
import { BackendCtxModule } from './types'

const saga = function* (input: { ctx: BackendCtxModule }) {
  const pings = input.ctx.topic.pingAll
    .subscribe(null, (msg) => ({ pingId: msg.pingId, now: Posix.now(), clientSessionId: msg.clientSessionId }) as const)
    .chan()

  yield takeEvery(pings, function* (ping) {
    console.log('ping', ping)
    input.ctx.topic.pong.publish(ping.clientSessionId, {
      pingId: ping.pingId,
    })
  })
}

export const BackendConnectionBackend = {
  saga,
}
