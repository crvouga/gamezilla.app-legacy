import { WEB_SOCKET_ENDPOINT } from '../shared'
import { type MsgClientToMsgServer, type MsgServerToMsgClient } from '../types'
import {
  initClientTransport,
  type ClientTransportCommand,
  type ClientTransportEvent,
  type IClientTransport
} from './interface'

const RECONNECT_INTERVAL = 2000
const MAX_RECONNECT_ATTEMPTS = 6

export type Config = {
  t: 'standard-web-sockets'
  serverUrl: string
}

export const ClientTransport = <MsgToServer, MsgToClient>(
  config: Config
): IClientTransport<{
  MsgToServer: MsgToServer
  MsgToClient: MsgToClient
}> => {
  const serverUrl = toWebsocketServerUrl(config.serverUrl.toString())

  const transport = initClientTransport<MsgToServer, MsgToClient>()

  if (typeof window === 'undefined') {
    return transport
  }

  let reconnectAttempts = 0
  let ws: WebSocket
  let isConnected = false
  let isDocumentHidden = false
  let queue: MsgClientToMsgServer<MsgToServer>[] = []

  const connect = async () => {
    if (isConnected) {
      return
    }

    ws = new WebSocket(serverUrl)

    ws.onopen = () => {
      isConnected = true
      reconnectAttempts = 0
      transport.msgEvt.pub({
        t: 'server-connected'
      })
      for (const msg of queue) {
        send(msg)
      }
      queue = []
    }

    ws.onerror = () => {
      isConnected = false
      transport.msgEvt.pub({
        t: 'server-connect-error'
      })
    }

    ws.onclose = () => {
      isConnected = false
      if (isDocumentHidden) {
        return
      }

      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        transport.msgEvt.pub({
          t: 'server-disconnected'
        })
        return
      }
      reconnectAttempts++
      setTimeout(connect, RECONNECT_INTERVAL)
      return
    }

    ws.onmessage = (msgEvt) => {
      isConnected = true
      const msg = JSON.parse(msgEvt.data) as MsgServerToMsgClient<MsgToClient>

      transport.fromServer.pub(msg)
    }
  }

  // const closeTimeout: ReturnType<typeof setTimeout> | null = null
  // document.addEventListener('visibilitychange', () => {
  //   if (document.hidden) {
  //     isDocumentHidden = true
  //     if (ws) {
  //       ws.close()
  //       isConnected = false
  //     }
  //     if (closeTimeout) {
  //       clearTimeout(closeTimeout)
  //     }
  //   } else {
  //     isDocumentHidden = false
  //     connect()
  //   }
  // })

  const send = (msg: MsgClientToMsgServer<MsgToServer>) => {
    if (!isConnected) {
      queue.push(msg)
      return
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg))
      return
    }
  }

  transport.toServer.sub((msgs) => {
    send(msgs)
  })

  transport.msgCmd.sub((msgCmd) => {
    switch (msgCmd.t) {
      case 'try-reconnect': {
        reconnectAttempts = 0
        connect()
        break
      }
    }
  })

  return {
    ...transport,
    start: connect
  }
}

type Model<MsgToServer> = {
  reconnectAttempts: number
  isConnected: boolean
  isDocumentHidden: boolean
  queue: MsgClientToMsgServer<MsgToServer>[]
}

export const init = <MsgToServer>(): Model<MsgToServer> => ({
  reconnectAttempts: 0,
  isConnected: false,
  isDocumentHidden: false,
  queue: []
})

export const update = <MsgToServer>(input: {
  codebaseVersionId: string
  model: Model<MsgToServer>
  evt?: ClientTransportEvent
  cmd?: ClientTransportCommand
  msg?: { t: 'to-server'; msgs: MsgToServer[] }
}): Model<MsgToServer> => {
  const msg = input.evt ?? input.cmd ?? input.msg
  if (!msg) {
    return input.model
  }
  switch (msg.t) {
    case 'to-server': {
      return {
        ...input.model,
        queue: input.model.queue.concat(msg.msgs)
      }
    }
    case 'try-reconnect': {
      return {
        ...input.model,
        reconnectAttempts: 0
      }
    }

    case 'got-bad-msgs': {
      return input.model
    }

    case 'server-connect-error': {
      return input.model
    }

    case 'server-connected': {
      return {
        ...input.model,
        isConnected: true,
        reconnectAttempts: 0
      }
    }

    case 'server-disconnected': {
      return {
        ...input.model,
        isConnected: false
      }
    }
  }
}

const toWebsocketServerUrl = (baseServerUrl: string) => {
  try {
    const baseServerUrlObj = new URL(baseServerUrl)

    if (typeof window === 'undefined') {
      return baseServerUrlObj.toString()
    }

    if (baseServerUrlObj.protocol === 'https:') {
      baseServerUrlObj.protocol = 'wss'
    }

    if (baseServerUrlObj.protocol === 'http:') {
      baseServerUrlObj.protocol = 'ws'
    }

    baseServerUrlObj.pathname = WEB_SOCKET_ENDPOINT

    return baseServerUrlObj.toString()
  } catch (e) {
    return WEB_SOCKET_ENDPOINT
  }
}
