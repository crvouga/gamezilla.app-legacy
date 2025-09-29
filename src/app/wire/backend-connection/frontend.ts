import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { Sub } from '~/@/sub'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { PingId } from './ping-id'
import { toPingRate } from './ping-rate'
import {
  FrontendCtxModule,
  FrontendModule,
  INITIAL_PINGS,
  isMsgFrontend,
  ModelFrontend,
  MsgFrontend,
  PingItem,
} from './types'
import { Eff } from '~/@/eff'

const update = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  const { msg, model } = input

  if (!isMsgFrontend(msg)) return { model }

  switch (msg.t) {
    case 'backendConnection_ping': {
      const pingNew: PingItem = { pingId: msg.pingId, pingAt: msg.now, pongAt: null }

      const pings = model.backendConnection_pings ?? INITIAL_PINGS

      const pingsNew = CappedOrderedDict.add(pings, msg.pingId, pingNew)

      const modelNew: T = { ...model, backendConnection_pings: pingsNew }

      return {
        model: modelNew,
        eff: () => {
          input.ctx.topic.backendConnection_ping.pub(input.ctx.clientSessionId, { pingId: msg.pingId })
        },
      }
    }

    case 'backendConnection_pong': {
      const pings = model.backendConnection_pings ?? INITIAL_PINGS

      const ping = CappedOrderedDict.get(pings, msg.pingId)

      if (!ping) return { model }

      const pingNew: PingItem = { ...ping, pongAt: msg.now }

      const pingsNew = CappedOrderedDict.set(pings, msg.pingId, pingNew)

      const modelNew: T = { ...model, backendConnection_pings: pingsNew }

      return { model: modelNew }
    }
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch([pings(input), pongs(input)])
}

const pings: FrontendModule['subscriptions'] = (input) => {
  const pingRate = toPingRate(input.model)
  return Time.interval(
    `pings${TimeSpan.toMilliseconds(pingRate)}`,
    pingRate,
    (now): MsgFrontend => ({ t: 'backendConnection_ping', now, pingId: PingId.generate() }),
  )
}

const pongs: FrontendModule['subscriptions'] = (input) => {
  return input.ctx.topic.backendConnection_pong.sub(
    input.ctx.clientSessionId,
    (msg): MsgFrontend => ({ t: 'backendConnection_pong', pingId: msg.pingId, now: UnixMs.now() }),
  )
}

export const BackendConnectionFrontend = {
  subscriptions,
  update,
}
