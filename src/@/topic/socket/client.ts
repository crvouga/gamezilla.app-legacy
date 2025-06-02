import { Client, ContractBase } from '../types'
import * as ClientLocal from './client-local'
import * as ClientWebSockets from './client-socket-p'

export type Config<T extends ContractBase> = ClientLocal.Config<T> | ClientWebSockets.Config<T>

export const initClient = <T extends ContractBase>(config: Config<T>): Client<T> => {
  switch (config.t) {
    case 'local':
      return ClientLocal.initClient(config)
    case 'web-sockets':
      return ClientWebSockets.initClient(config)
  }
}
