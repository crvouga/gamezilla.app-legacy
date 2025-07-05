import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { Sub } from '~/@/sub'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { BackendConnectionStatus } from '../../@/wire/backend-connection-status'
import { PingId } from './ping-id'
import { toPingRate } from './ping-rate'
import { FrontendModule, initModel, Model, MsgFrontend, PingItem } from './types'

const init: FrontendModule['init'] = (_input) => {
  const model = initModel()

  return {
    model: model,
  }
}

const update: FrontendModule['update'] = (input) => {
  const { msg, model } = input

  if (!msg) return { model }

  switch (msg.t) {
    case 'ping': {
      const pingNew: PingItem = { pingId: msg.pingId, pingAt: msg.now, pongAt: null }

      const pingsNew = CappedOrderedDict.add(model.pings, msg.pingId, pingNew)

      const modelNew: Model = { ...model, pings: pingsNew }

      return {
        model: modelNew,
        eff: () => {
          input.ctx.topic.ping.pub(input.ctx.clientSessionId, { pingId: msg.pingId })
        },
      }
    }

    case 'pong': {
      const ping = CappedOrderedDict.get(model.pings, msg.pingId)

      if (!ping) return { model }

      const pingNew: PingItem = { ...ping, pongAt: msg.now }

      const pingsNew = CappedOrderedDict.set(model.pings, msg.pingId, pingNew)

      const modelNew: Model = { ...model, pings: pingsNew }

      return { model: modelNew }
    }
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch([pings(input), pongs(input)])
}

const pings: FrontendModule['subscriptions'] = (input) => {
  const pingRate = toPingRate(input.model)
  return Time.interval('pings', pingRate, (now): MsgFrontend => ({ t: 'ping', now, pingId: PingId.generate() }))
}

const pongs: FrontendModule['subscriptions'] = (input) => {
  return input.ctx.topic.pong.sub(
    input.ctx.clientSessionId,
    (msg): MsgFrontend => ({ t: 'pong', pingId: msg.pingId, now: UnixMs.now() }),
  )
}

const toBackendConnectionStatus = (model: Model): BackendConnectionStatus => {
  const ping = CappedOrderedDict.valuesNewestFirst(model.pings).find((ping) => ping.pongAt)

  if (!ping) return { t: 'connecting' }

  if (!ping.pongAt) return { t: 'connecting' }

  return {
    t: 'connected',
    averagePing: toAveragePing(model),
    latestPing: UnixMs.diff(ping.pingAt, ping.pongAt),
  }
}

const toAveragePing = (model: Model): TimeSpan => {
  const pings = CappedOrderedDict.valuesNewestFirst(model.pings)
  const total = pings.reduce(
    (acc, ping) => (ping.pongAt ? acc + TimeSpan.toMilliseconds(UnixMs.diff(ping.pingAt, ping.pongAt)) : acc),
    0,
  )
  const average = Math.floor(total / pings.length)
  return TimeSpan.milliseconds(average)
}

export const BackendConnectionFrontend = {
  subscriptions,
  update,
  init,
  toBackendConnectionStatus,
}
