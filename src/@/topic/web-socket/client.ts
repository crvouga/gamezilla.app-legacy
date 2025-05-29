import { Sub } from '~/@/sub'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { Client, Contract } from '../types'
import { ToServerMsg, toTopicString } from './shared'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'

export type ClientConfigWebSocket<T extends Contract<any>> = {
  t: 'web-sockets'
  contract: T
  serverUrl: string
  endpoint: string
  clientSessionId: ClientSessionId
  sessionId: SessionId
}

export const initClient = <T extends Contract<any>>(clientConfig: ClientConfigWebSocket<T>): Client<T> => {
  const ws = new WebSocket(
    changeToWebsocketProtocol({
      serverUrl: clientConfig.serverUrl,
      endpoint: clientConfig.endpoint,
      clientSessionId: clientConfig.clientSessionId,
    }),
  )
  const subscriptions = new Map<string, Sub<unknown>>()

  ws.onmessage = (event) => {
    const msg = event.data
    console.log('msg', msg)
  }

  const createClientRecursive = (currentContract: Contract<any>, currentPath: string[] = []): any => {
    const clientProxy: any = {}

    for (const topicName in currentContract) {
      const topicConfig = currentContract[topicName]

      if (!topicConfig) continue

      const topicPath: string[] = [...currentPath, topicName]

      if ('params' in topicConfig && 'msg' in topicConfig) {
        // const topicDefinition = topicConfig as Topic<any, any>

        clientProxy[topicName] = {
          publish: async (topicParams: unknown, msg: unknown) => {
            const toServerMsg: ToServerMsg = {
              t: 'publish',
              topicName: topicPath,
              topicParams,
              msg: JSON.stringify(msg),
            }
            ws.send(JSON.stringify(toServerMsg))
          },
          subscribe: (topicParams: unknown): Sub<any> => {
            const topicString = toTopicString({
              topicName: topicPath,
              topicParams,
            })

            const existingSub = subscriptions.get(topicString)

            if (existingSub) return existingSub

            const toServerMsg: ToServerMsg = {
              t: 'subscribe',
              topicName: topicPath,
              topicParams,
            }
            ws.send(JSON.stringify(toServerMsg))

            const subNew = Sub.create()

            subscriptions.set(topicString, subNew)

            return {
              ...subNew,
              sub(subscriber) {
                const unsub = subNew.sub(subscriber)
                return () => {
                  unsub()
                  const toServerMsg: ToServerMsg = {
                    t: 'unsubscribe',
                    topicName: topicPath,
                    topicParams,
                  }
                  ws.send(JSON.stringify(toServerMsg))
                }
              },
            }
          },
        }
      } else {
        clientProxy[topicName] = createClientRecursive(topicConfig as Contract<any>, [...currentPath, topicName])
      }
    }
    return clientProxy
  }

  return createClientRecursive(clientConfig.contract) as Client<T>
}

const changeToWebsocketProtocol = (input: {
  serverUrl: string
  endpoint: string
  clientSessionId: ClientSessionId
}) => {
  try {
    const baseBackendUrlObj = ClientSessionIdHttp.addToUrl(new URL(input.serverUrl), input.clientSessionId)

    if (typeof window === 'undefined') {
      return baseBackendUrlObj.toString()
    }

    if (baseBackendUrlObj.protocol === 'https:') {
      baseBackendUrlObj.protocol = 'wss'
    }

    if (baseBackendUrlObj.protocol === 'http:') {
      baseBackendUrlObj.protocol = 'ws'
    }

    baseBackendUrlObj.pathname = input.endpoint

    return baseBackendUrlObj.toString()
  } catch (e) {
    console.error(
      'Failed to parse baseBackendUrl',
      input.serverUrl,
      'falling back to',
      input.endpoint,
      'with clientSessionId',
      input.clientSessionId,
    )
    return input.endpoint
  }
}
