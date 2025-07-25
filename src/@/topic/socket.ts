import { Sub } from '~/@/sub'

/**
 * A web socket is a connection to a server.
 */
const create = (config: { url: string }) => {
  const msgsOpen = Sub.init<{ t: 'opened' }>()
  const msgsClose = Sub.init<{ t: 'closed' }>()
  const msgsError = Sub.init<{ t: 'error'; error: Event }>()
  const msgsFromServer = Sub.init<MessageEvent<any>>()

  const ws = new WebSocket(config.url)

  ws.onopen = () => {
    msgsOpen.pub({ t: 'opened' })
  }

  ws.onclose = () => {
    msgsClose.pub({ t: 'closed' })
  }

  ws.onerror = (error) => {
    msgsError.pub({ t: 'error', error })
  }

  ws.onmessage = async (event) => {
    msgsFromServer.pub(event)
  }

  const close = () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close()
    }

    if (ws.readyState === WebSocket.CONNECTING) {
      setTimeout(() => close(), 1000)
      return
    }

    ws.onopen = null
    ws.onclose = null
    ws.onerror = null
    ws.onmessage = null
  }

  const send = (msg: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    ws.send(msg)
  }

  return {
    msgsOpen,
    msgsClose,
    msgsError,
    msgsFromServer,
    send,
    close,
  }
}

export type Socket = ReturnType<typeof create>

export const Socket = {
  create,
}
