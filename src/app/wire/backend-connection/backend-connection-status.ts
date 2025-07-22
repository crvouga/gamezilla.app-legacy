import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { BackendConnectionStatus } from '~/app/@/wire/backend-connection-status'
import { Model } from './types'

export const toBackendConnectionStatus = (model: Model): BackendConnectionStatus => {
  const ping = CappedOrderedDict.valuesNewestFirst(model.pings).find((ping) => ping.pongAt !== null)

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
