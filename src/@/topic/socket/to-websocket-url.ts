import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'

export const toWebSocketUrl = (input: { serverUrl: string; endpoint: string; clientSessionId: ClientSessionId }) => {
  try {
    const baseBackendUrlObj = ClientSessionIdHttp.addToUrl(new URL(input.serverUrl), input.clientSessionId)

    baseBackendUrlObj.pathname = input.endpoint

    if (baseBackendUrlObj.protocol === 'https:') {
      baseBackendUrlObj.protocol = 'wss'
    }

    if (baseBackendUrlObj.protocol === 'http:') {
      baseBackendUrlObj.protocol = 'ws'
    }

    return baseBackendUrlObj.toString()
  } catch (e) {
    return input.endpoint
  }
}
