import { isOk } from '../result'
import { ClientSessionId } from './client-session-id'

const PARAM_NAME = 'client-session-id'

const fromUrl = (url: URL): ClientSessionId | null => {
  const clientSessionId = url.searchParams.get(PARAM_NAME)
  if (clientSessionId) {
    const decoded = ClientSessionId.decode(clientSessionId)
    if (isOk(decoded)) {
      return decoded.value
    }
  }
  return null
}

const fromRequest = (request: Request): ClientSessionId | null => {
  const url = new URL(request.url)
  return fromUrl(url)
}

const addToUrl = (url: URL, clientSessionId: ClientSessionId): URL => {
  const newUrl = new URL(url.toString())
  newUrl.searchParams.set(PARAM_NAME, clientSessionId)
  return newUrl
}

const toSearchParam = (clientSessionId: ClientSessionId): string => {
  return `${PARAM_NAME}=${clientSessionId}`
}

export const ClientSessionIdHttp = {
  fromUrl,
  fromRequest,
  addToUrl,
  toSearchParam,
}
