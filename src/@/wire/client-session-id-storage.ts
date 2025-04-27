import { unwrapOr } from '../result'
import { ClientSessionId } from './client-session-id'

export type IClientSessionIdStorage = {
  get: () => ClientSessionId
}

const getStorage = (input?: { storage?: Storage }): Storage => {
  if (input?.storage) {
    return input.storage
  }

  if (typeof window === 'undefined') {
    return InMemoryStorage()
  }

  return localStorage
}

export const ClientSessionIdStorage = (input?: { storage?: Storage }): IClientSessionIdStorage => {
  const KEY = 'clientSessionId'
  const storage = getStorage(input)
  return {
    get: () => {
      const clientSessionId = storage.getItem(KEY)
      if (clientSessionId) {
        return unwrapOr(ClientSessionId.decode(clientSessionId), ClientSessionId.generate())
      }
      const clientSessionIdNew = ClientSessionId.generate()
      storage.setItem(KEY, clientSessionIdNew)
      return clientSessionIdNew
    },
  }
}

const InMemoryStorage = (): Storage => {
  const storage = new Map<string, string>()
  return {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      storage.set(key, value)
    },
    removeItem: (key) => {
      storage.delete(key)
    },
    clear: () => {
      storage.clear()
    },
    length: 0,
    key: (index) => Array.from(storage.keys())[index] ?? null,
  }
}
