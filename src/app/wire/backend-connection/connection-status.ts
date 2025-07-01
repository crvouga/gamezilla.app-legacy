import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { Translator } from '~/@/l18n/generated'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { h } from '~/@/vdom/h'
import { Model } from './types'
import { Dot } from './ui'

export type BackendConnectionStatus =
  | { t: 'connected'; averagePing: TimeSpan; latestPing: TimeSpan }
  | { t: 'disconnected' }
  | { t: 'connecting' }

const fromModel = (model: Model): BackendConnectionStatus => {
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

const ViewDot = (input: { model: BackendConnectionStatus; ctx: { t: Translator }; class: string }) => {
  switch (input.model.t) {
    case 'connected': {
      return h(Dot, { class: input.class, colorClassName: 'bg-green-500' })
    }

    case 'connecting': {
      return h(Dot, { class: input.class, colorClassName: 'animate-pulse bg-orange-500' })
    }

    case 'disconnected': {
      return h(Dot, { class: input.class, colorClassName: 'bg-red-500' })
    }
  }
}

export const BackendConnectionStatus = {
  fromModel,
  ViewDot,
}
