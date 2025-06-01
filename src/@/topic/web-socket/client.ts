import { Contract } from '~/@/rpc/types'
import { Client } from '../types'
import * as ClientLocal from './client-local'
import * as ClientWebSockets from './client-web-sockets'

export type Config<T extends Contract<any>> = ClientLocal.Config<T> | ClientWebSockets.Config<T>

export const initClient = <T extends Contract<any>>(config: Config<T>): Client<T> => {
  switch (config.t) {
    case 'local':
      return ClientLocal.initClient(config)
    case 'web-sockets':
      return ClientWebSockets.initClient(config)
  }
}
