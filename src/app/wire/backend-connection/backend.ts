import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { BackendModule, MsgBackend } from './types'

const update: BackendModule['update'] = async (input) => {
  const { msg } = input

  if (!msg) return {}

  switch (msg.t) {
    case 'ping': {
      input.ctx.topic.pong.publish(msg.clientSessionId, {
        pingId: msg.pingId,
      })
      return {}
    }
  }
}

const subscriptions: BackendModule['subscriptions'] = async (input) => {
  return Sub.batch([await pings(input)])
}

const pings: BackendModule['subscriptions'] = async (input) => {
  return input.ctx.topic.pingAll.subscribe(
    null,
    (msg, meta): MsgBackend => ({
      t: 'ping',
      pingId: msg.pingId,
      now: Posix.now(),
      clientSessionId: meta.clientSessionId,
    }),
  )
}

export const BackendConnectionFrontend = {
  subscriptions,
  update,
}
