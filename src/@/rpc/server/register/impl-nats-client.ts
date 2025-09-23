import { ILogger } from '~/@/logger'
import { Url } from '~/@/url/url'
import { Base, Server } from '../../types'

export type ImplNatsClient<T extends Base> = {
  t: 'nats-client'
  getServerUrls: () => Promise<Url[]>
  contract: T
  server: Server<T>
  logger: ILogger
}

const register = <T extends Base>(self: ImplNatsClient<T>): void => {
  const logger_ = self.logger.child(['rpc'])
  logger_.info('Registering Nats client')
}

export const ImplNatsClient = {
  register,
}
