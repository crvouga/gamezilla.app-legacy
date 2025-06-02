import { TimeSpan } from '~/@/time/time-span'
import { BackendConnectionStatus } from './connection-status'
import { Model } from './types'

const PING_RATE = TimeSpan.seconds(10)

export const toPingRate = (model: Model): TimeSpan => {
  const status = BackendConnectionStatus.fromModel(model)

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
