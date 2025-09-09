import { ImplWebSocketInHouse } from './impl-web-socket-in-house'
import { ImplWebSocketNats } from './impl-web-socket-nats'
import { IFixture } from './interface'

export type Fixture = ImplWebSocketInHouse | ImplWebSocketNats

const init = (config: Fixture): Promise<IFixture> => {
  switch (config.t) {
    case 'web-socket-in-house':
      return ImplWebSocketInHouse.init(config)
    case 'web-socket-nats':
      return ImplWebSocketNats.init(config)
  }
}

export const Fixture = {
  init,
}
