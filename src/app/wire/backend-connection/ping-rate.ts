import { TimeSpan } from '~/@/time/time-span'
import { toBackendConnectionStatus } from './backend-connection-status'
import { Model } from './types'

export const toPingRate = (model: Model): TimeSpan => {
  const status = toBackendConnectionStatus(model)
  switch (status.t) {
    case 'connected': {
      return TimeSpan.seconds(5)
    }
    case 'connecting': {
      return TimeSpan.seconds(1 / 2)
    }
    case 'disconnected': {
      return TimeSpan.seconds(1 / 2)
    }
  }
}
