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
    default: {
      return {}
    }
  }
}

const subscriptions: BackendModule['subscriptions'] = async (input) => {
  return input.ctx.topic.pingAll.subscribe(null, (msg): MsgBackend => {
    return {
      t: 'ping',
      pingId: msg.pingId,
      now: Posix.now(),
      clientSessionId: msg.clientSessionId,
    }
  })
}

export const BackendConnectionBackend = {
  subscriptions,
  update,
}
