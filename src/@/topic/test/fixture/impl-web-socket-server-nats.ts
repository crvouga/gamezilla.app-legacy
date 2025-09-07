export type ImplWebSocketServerNats = {
  t: 'web-socket-server-nats'
}

const init = async (_config?: ImplWebSocketServerNats) => {
  throw new Error('not implemented')
}

export const ImplWebSocketServerNats = {
  init,
}
