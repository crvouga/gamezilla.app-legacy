import { Contract } from './types'

export const initWebSocketServer = (_contract: Contract<any>) => {
  return {
    subscribe: () => {},
    publish: () => {},
  }
}
