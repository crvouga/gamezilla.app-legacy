import { Sub } from '~/@/sub'
import { TopicMsgCodec } from './topic-msg-codec'

/**
 * A web socket is a connection to a server.
 */
const create = (config: { url: string; codec: TopicMsgCodec }) => {
  const msgsOpen = Sub.create<{ t: 'opened' }>()
  const msgsClose = Sub.create<{ t: 'closed' }>()
  const msgsError = Sub.create<{ t: 'error'; error: Event }>()
  const msgsFromServer = Sub.create<unknown>()

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
    msgsFromServer.pub(await config.codec.socketMessageEventToMsgFromServer(event))
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
