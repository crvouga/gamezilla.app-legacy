import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { PingId } from './ping-id'
import { toPingRate } from './ping-rate'
import { FrontendCtxModule, INITIAL_PINGS, ModelFrontend, MsgFrontend, PingItem } from './types'

export const init = (_input: {}): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  return {
    model: {
      backendConnection_pings: INITIAL_PINGS,
    },
  }
}

export const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: MsgFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  const { msg, model } = input

  switch (msg.t) {
    case 'backendConnection_ping': {
      const pingNew: PingItem = { pingId: msg.pingId, pingAt: msg.now, pongAt: null }

      const pings = model.backendConnection_pings ?? INITIAL_PINGS

      const pingsNew = CappedOrderedDict.add(pings, msg.pingId, pingNew)

      const modelNew: ModelFrontend = { ...model, backendConnection_pings: pingsNew }

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

      const modelNew: ModelFrontend = { ...model, backendConnection_pings: pingsNew }

      return { model: modelNew }
    }
  }
}
const DISABLE = false
export const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  if (DISABLE) return Sub.none()
  return Sub.batch([pings(input), pongs(input)])
}

const pings: typeof subscriptions = (input) => {
  const pingRate = toPingRate(input.model)
  return Time.interval(
    `pings${TimeSpan.toMilliseconds(pingRate)}`,
    pingRate,
    (now): MsgFrontend => ({ n: 'backendConnection', t: 'backendConnection_ping', now, pingId: PingId.generate() }),
  )
}

const pongs: typeof subscriptions = (input) => {
  return input.ctx.topic.backendConnection_pong.sub(
    input.ctx.clientSessionId,
    (msg): MsgFrontend => ({
      n: 'backendConnection',
      t: 'backendConnection_pong',
      pingId: msg.pingId,
      now: UnixMs.now(),
    }),
  )
}
