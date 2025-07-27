import { IKeyValueDbSync } from '../key-value-db-sync'
import { isErr } from '../result'
import { s } from '../schema'
import { ClientSessionId } from './client-session-id'

export type IClientSessionIdStorage = {
  get: () => ClientSessionId
}

const init = (input: { keyValueDbSync: IKeyValueDbSync }): IClientSessionIdStorage => {
  const KEY = 'clientSessionId'
  const gen = () => {
    const clientSessionIdNew = ClientSessionId.generate()
    input.keyValueDbSync.set(KEY, clientSessionIdNew)
    return clientSessionIdNew
  }
  return {
    get() {
      const gotClientSessionId = input.keyValueDbSync.get(KEY, s.str())

      if (isErr(gotClientSessionId)) return gen()

      const maybeClientSessionId = gotClientSessionId.value

      if (!maybeClientSessionId) return gen()

      const clientSessionId = ClientSessionId.decode(maybeClientSessionId)

      if (isErr(clientSessionId)) return gen()

      return clientSessionId.value
    },
  }
}

export const ClientSessionIdStorage = {
  init,
}
