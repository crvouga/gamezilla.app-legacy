import { TimeSpan } from '~/@/time/time-span'
import { BackendConnectionStatus } from './connection-status'
import { Model } from './types'

export const toPingRate = (model: Model): TimeSpan => {
  const status = BackendConnectionStatus.fromModel(model)

  switch (status.t) {
    case 'connected': {
      return TimeSpan.seconds(10)
    }
    case 'connecting': {
      return TimeSpan.seconds(1)
    }
    case 'disconnected': {
      return TimeSpan.seconds(1)
    }
  }
}
