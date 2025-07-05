import { TimeSpan } from '~/@/time/time-span'
import { BackendConnectionFrontend } from './frontend'
import { Model } from './types'

const PING_RATE = TimeSpan.seconds(3)

export const toPingRate = (model: Model): TimeSpan => {
  const status = BackendConnectionFrontend.toBackendConnectionStatus(model)

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
