import { s } from '~/@/schema'
import { Sub } from '~/@/sub'

const create = <ToServerMsg, ToClientMsg>(config: {
  url: string
  ToServerMsg: s.Schema<ToServerMsg>
  ToClientMsg: s.Schema<ToClientMsg>
}) => {
  const msgsOpen = Sub.create<{ t: 'opened' }>()
  const msgsClose = Sub.create<{ t: 'closed' }>()
  const msgsError = Sub.create<{ t: 'error'; error: Event }>()
  const msgsFromServer = Sub.create<ToClientMsg>()

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

  ws.onmessage = (event) => {
    const toClientMsg: ToClientMsg = JSON.parse(event.data as string) as ToClientMsg
    msgsFromServer.pub(toClientMsg)
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

  const send = (toServer: ToServerMsg) => {
    ws.send(JSON.stringify(toServer))
  }

  return {
    msgsOpen,
    msgsClose,
    msgsError,
    msgsFromServer,
    close,
    send,
  }
}

export type Socket<TToServerMsg, TToClientMsg> = ReturnType<typeof create<TToServerMsg, TToClientMsg>>

export const Socket = {
  create,
}
