import { Sub } from '~/@/sub'

const create = (config: { url: string }) => {
  const msgsOpen = Sub.create<{ t: 'opened' }>()
  const msgsClose = Sub.create<{ t: 'closed' }>()
  const msgsError = Sub.create<{ t: 'error'; error: Event }>()
  const msgsFromServer = Sub.create<string>()

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
    msgsFromServer.pub(event.data)
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

  const send = (toServer: string) => {
    ws.send(toServer)
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

export type Socket = ReturnType<typeof create>

export const Socket = {
  create,
}
