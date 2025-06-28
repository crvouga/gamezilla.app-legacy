import { type ILogger } from '~/@/logger'
import { Sub } from '../sub'
import { HttpServerEvent, type IHttpServer } from './interface'

export type Config = {
  t: 'noop'
  logger: ILogger
}
export const HttpServerNoop = (
  _config: Config,
): IHttpServer & {
  t: 'noop'
} => {
  return {
    t: 'noop',
    events: Sub.create<HttpServerEvent>(),
    registerMiddleware: () => {},
    registerRespond: () => {},
    start: () => Promise.resolve(),
    stop: () => Promise.resolve(),
  }
}
