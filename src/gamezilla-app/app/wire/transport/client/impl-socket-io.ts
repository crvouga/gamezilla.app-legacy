import type { MsgClientToMsgServer, MsgServerToMsgClient } from '../types'
import { type IClientTransport, initClientTransport } from './interface'

export type Config = {
  t: 'socket.io'
  codebaseVersionId: string
  serverUrl: string
}

export const ClientTransport = async <MsgToServer, MsgToClient>(
  config: Config
): Promise<
  IClientTransport<{
    MsgToServer: MsgToServer
    MsgToClient: MsgToClient
  }>
> => {
  const { io } = await import('socket.io-client')

  const transport = initClientTransport<MsgToServer, MsgToClient>()

  const start = async () => {
    await fetch(`${config.serverUrl.toString()}/set-session-cookie`, {
      credentials: 'include'
    })

    const socket = io(config.serverUrl.toString(), {
      transports: ['websocket'],
      withCredentials: true
    })

    socket.on('connect', () => {
      transport.msgEvt.pub({
        t: 'server-connected'
      })
    })

    socket.on('connect_error', () => {
      transport.msgEvt.pub({
        t: 'server-connect-error'
      })
    })

    socket.on('disconnect', () => {
      transport.msgEvt.pub({
        t: 'server-disconnected'
      })
    })

    const sendToServer = (msgs: MsgToServer[]) => {
      const toServer: MsgClientToMsgServer<MsgToServer> = {
        m: msgs,
        v: config.codebaseVersionId
      }

      socket.emit('to-server', toServer, (err: unknown) => {
        if (err) {
          console.error('Error sending to server', err, toServer)
          sendToServer(msgs)
        }
      })
    }

    transport.toServer.sub((msgs) => {
      sendToServer(msgs)
    })

    socket.on('to-client', (msg: MsgServerToMsgClient<MsgToClient>) => {
      if (msg.v !== config.codebaseVersionId) {
        console.warn('Codebase version mismatch')
      }
      transport.fromServer.pub(msg.m)
    })

    transport.msgCmd.sub((msgCmd) => {
      switch (msgCmd.t) {
        case 'try-reconnect': {
          socket.connect()
          break
        }
        default: {
          const _exhaustiveCheck: never = msgCmd.t
          return _exhaustiveCheck
        }
      }
    })
  }

  return {
    ...transport,
    start
  }
}
