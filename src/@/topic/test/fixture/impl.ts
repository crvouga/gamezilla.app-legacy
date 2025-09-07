import { ImplWebSocketServer } from './impl-web-socket-server'
import { ImplWebSocketServerNats } from './impl-web-socket-server-nats'

export type Fixture = ImplWebSocketServer | ImplWebSocketServerNats

const init = (config: Fixture) => {
  switch (config.t) {
    case 'web-socket-server':
      return ImplWebSocketServer.init(config)
    case 'web-socket-server-nats':
      return ImplWebSocketServerNats.init(config)
  }
}

export const Fixture = {
  init,
}
