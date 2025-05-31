import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { Translator } from '~/@/l18n/generated'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { Model } from './types'
import { Dot } from './ui'

export type BackendConnectionStatus = { t: 'connected'; ping: TimeSpan } | { t: 'disconnected' } | { t: 'connecting' }

const fromModel = (model: Model): BackendConnectionStatus => {
  const latestPing = CappedOrderedDict.latest(model.pings)

  if (!latestPing) {
    return { t: 'connecting' }
  }

  if (!latestPing.pongAt) {
    return { t: 'connecting' }
  }

  return { t: 'connected', ping: Posix.diff(latestPing.pingAt, latestPing.pongAt) }
}

const ViewDot = (input: { model: BackendConnectionStatus; ctx: { t: Translator }; className: string }) => {
  switch (input.model.t) {
    case 'connected': {
      return <Dot className={input.className} colorClassName='bg-green-500' />
    }

    case 'connecting': {
      return <Dot className={input.className} colorClassName='animate-pulse bg-orange-500' />
    }

    case 'disconnected': {
      return <Dot className={input.className} colorClassName='bg-red-500' />
    }
  }
}

export const BackendConnectionStatus = {
  fromModel,
  ViewDot,
}
