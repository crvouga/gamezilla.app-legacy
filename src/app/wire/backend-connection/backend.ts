import { Sub } from '~/@/sub'
import { UnixMs } from '~/@/time/unix-ms'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { topicContract } from './types'

const worker = async (s: AbortSignal, input: { topic: ITopicClient<typeof topicContract> }) => {
  const pings = input.topic.backendConnection_ping.subAll((msg) => ({
    pingId: msg.pingId,
    now: UnixMs.now(),
    clientSessionId: msg.clientSessionId,
  }))

  Sub.takeEvery(s, pings, (ping) => {
    console.log('pong', ping)
    input.topic.backendConnection_pong.pub(ping.clientSessionId, {
      pingId: ping.pingId,
    })
  })
}

export const BackendConnectionBackend = {
  worker,
}
