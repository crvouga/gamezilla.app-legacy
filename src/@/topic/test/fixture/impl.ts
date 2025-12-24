import { ImplWebSocketInHouse } from './impl-web-socket-in-house'
import { IFixture } from './interface'

export type Fixture = ImplWebSocketInHouse

const init = (config: Fixture): Promise<IFixture> => {
  switch (config.t) {
    case 'web-socket-in-house':
      return ImplWebSocketInHouse.init(config)
  }
}

export const Fixture = {
  init,
}
