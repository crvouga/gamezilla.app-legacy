import { WEB_SOCKET_ENDPOINT } from '../shared'
import { type MsgFrontendToMsgBackend, type MsgBackendToMsgFrontend } from '../types'
import {
  initFrontendTransport,
  type FrontendTransportCommand,
  type FrontendTransportEvent,
  type IFrontendTransport,
} from './interface'

const RECONNECT_INTERVAL = 2000
const MAX_RECONNECT_ATTEMPTS = 6

export type Config = {
  t: 'standard-web-sockets'
  backendUrl: string
}

export const FrontendTransport = <MsgToBackend, MsgToFrontend>(
  config: Config,
): IFrontendTransport<{
  MsgToBackend: MsgToBackend
  MsgToFrontend: MsgToFrontend
}> => {
  const backendUrl = toWebsocketBackendUrl(config.backendUrl.toString())

  const transport = initFrontendTransport<MsgToBackend, MsgToFrontend>()

  if (typeof window === 'undefined') {
    return transport
  }

  let reconnectAttempts = 0
  let ws: WebSocket
  let isConnected = false
  let isDocumentHidden = false
  let queue: MsgFrontendToMsgBackend<MsgToBackend>[] = []

  const connect = async () => {
    if (isConnected) {
      return
    }

    ws = new WebSocket(backendUrl)

    ws.onopen = () => {
      isConnected = true
      reconnectAttempts = 0
      transport.msgEvt.pub({
        t: 'backend-connected',
      })
      for (const msg of queue) {
        send(msg)
      }
      queue = []
    }

    ws.onerror = () => {
      isConnected = false
      transport.msgEvt.pub({
        t: 'backend-connect-error',
      })
    }

    ws.onclose = () => {
      isConnected = false
      if (isDocumentHidden) {
        return
      }

      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        transport.msgEvt.pub({
          t: 'backend-disconnected',
        })
        return
      }
      reconnectAttempts++
      setTimeout(connect, RECONNECT_INTERVAL)
      return
    }

    ws.onmessage = (msgEvt) => {
      try {
        isConnected = true
        const msg = JSON.parse(msgEvt.data) as MsgBackendToMsgFrontend<MsgToFrontend>
        transport.fromBackend.pub(msg)
      } catch (e) {
        console.log('got bad msg', e)
      }
    }
  }

  const closeTimeout: ReturnType<typeof setTimeout> | null = null
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isDocumentHidden = true
      if (ws) {
        ws.close()
        isConnected = false
      }
      if (closeTimeout) {
        clearTimeout(closeTimeout)
      }
    } else {
      isDocumentHidden = false
      connect()
    }
  })

  const send = (msg: MsgFrontendToMsgBackend<MsgToBackend>) => {
    if (!isConnected) {
      queue.push(msg)
      return
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg))
      return
    }
  }

  transport.toBackend.sub((msgs) => {
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
    start: connect,
  }
}

type Model<MsgToBackend> = {
  reconnectAttempts: number
  isConnected: boolean
  isDocumentHidden: boolean
  queue: MsgFrontendToMsgBackend<MsgToBackend>[]
}

export const init = <MsgToBackend>(): Model<MsgToBackend> => ({
  reconnectAttempts: 0,
  isConnected: false,
  isDocumentHidden: false,
  queue: [],
})

export const update = <MsgToBackend>(input: {
  codebaseVersionId: string
  model: Model<MsgToBackend>
  evt?: FrontendTransportEvent
  cmd?: FrontendTransportCommand
  msg?: { t: 'to-backend'; msgs: MsgToBackend[] }
}): Model<MsgToBackend> => {
  const msg = input.evt ?? input.cmd ?? input.msg
  if (!msg) {
    return input.model
  }
  switch (msg.t) {
    case 'to-backend': {
      return {
        ...input.model,
        queue: input.model.queue.concat(msg.msgs),
      }
    }
    case 'try-reconnect': {
      return {
        ...input.model,
        reconnectAttempts: 0,
      }
    }

    case 'got-bad-msgs': {
      return input.model
    }

    case 'backend-connect-error': {
      return input.model
    }

    case 'backend-connected': {
      return {
        ...input.model,
        isConnected: true,
        reconnectAttempts: 0,
      }
    }

    case 'backend-disconnected': {
      return {
        ...input.model,
        isConnected: false,
      }
    }
  }
}

const toWebsocketBackendUrl = (baseBackendUrl: string) => {
  try {
    const baseBackendUrlObj = new URL(baseBackendUrl)

    if (typeof window === 'undefined') {
      return baseBackendUrlObj.toString()
    }

    if (baseBackendUrlObj.protocol === 'https:') {
      baseBackendUrlObj.protocol = 'wss'
    }

    if (baseBackendUrlObj.protocol === 'http:') {
      baseBackendUrlObj.protocol = 'ws'
    }

    baseBackendUrlObj.pathname = WEB_SOCKET_ENDPOINT

    return baseBackendUrlObj.toString()
  } catch (e) {
    return WEB_SOCKET_ENDPOINT
  }
}
