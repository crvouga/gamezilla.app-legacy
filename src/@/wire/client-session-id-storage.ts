import { IKeyValueDb } from '../key-value-db'
import { isErr } from '../result'
import { s } from '../schema'
import { ClientSessionId } from './client-session-id'

export type IClientSessionIdStorage = {
  get: () => Promise<ClientSessionId>
}

const init = (input: { keyValueDb: IKeyValueDb }): IClientSessionIdStorage => {
  const KEY = 'clientSessionId'
  const gen = async () => {
    const clientSessionIdNew = ClientSessionId.generate()
    await input.keyValueDb.set(KEY, clientSessionIdNew)
    return clientSessionIdNew
  }
  return {
    async get() {
      const gotClientSessionId = await input.keyValueDb.get(KEY, s.str())

      if (isErr(gotClientSessionId)) {
        return gen()
      }

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
