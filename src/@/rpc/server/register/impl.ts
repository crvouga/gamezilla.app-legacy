import { Base } from '../../types'
import { ImplHttpServer } from './impl-http-server'
import { ImplNatsClient } from './impl-nats-client'

export type Register<T extends Base> = ImplNatsClient<T> | ImplHttpServer<T>

export const register = <T extends Base>(self: Register<T>): void => {
  switch (self.t) {
    case 'nats-client':
      return ImplNatsClient.register(self)
    case 'http-server':
      return ImplHttpServer.register(self)
  }
}
