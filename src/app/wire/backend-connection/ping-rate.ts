import { TimeSpan } from '~/@/time/time-span'
import { toBackendConnectionStatus } from './backend-connection-status'
import { Model } from './types'

const PING_RATE = TimeSpan.seconds(1)

export const toPingRate = (model: Model): TimeSpan => {
  const status = toBackendConnectionStatus(model)

  switch (status.t) {
    case 'connected': {
      return PING_RATE
    }
    case 'connecting': {
      return PING_RATE
    }
    case 'disconnected': {
      return PING_RATE
    }
  }
}
