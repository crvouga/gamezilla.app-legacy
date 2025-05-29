import { initClientHttp } from './init-http'
import { initClientLocal } from './init-local'
import { Base, Client, ClientConfig } from '../types'

export const initClient = <T extends Base>(config: ClientConfig<T>): Client<T> => {
  switch (config.t) {
    case 'http':
      return initClientHttp(config)
    case 'local':
      return initClientLocal(config)
  }
}
