import { Base, Server } from '../types'

export const initServer = <T extends Base>(_contract: T, handlers: Server<T>): Server<T> => {
  return handlers
}
