import { Base } from '../../types'
import { ImplHttpServer } from './impl-http-server'

export type Register<T extends Base> = ImplHttpServer<T>

export const register = <T extends Base>(self: Register<T>): void => {
  switch (self.t) {
    case 'http-server':
      return ImplHttpServer.register(self)
  }
}
