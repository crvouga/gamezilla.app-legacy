import { Base, Client, ClientConfig } from '../types'
import { initClientHttp } from './impl-http'
import { initClientLocal } from './impl-local'

export const initClient = <T extends Base>(config: ClientConfig<T>): Client<T> => {
  switch (config.t) {
    case 'http':
      return initClientHttp(config)
    case 'local':
      return initClientLocal(config)
  }
}
