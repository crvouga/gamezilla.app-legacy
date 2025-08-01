import { IKeyValueDb } from '../key-value-db'
import { isErr } from '../result'
import { s } from '../schema'
import { VDomImplWeb } from './vdom-impl-web'

export type IVdomImplWebStorage = {
  get: () => Promise<VDomImplWeb>
  set: (vdomImplWeb: VDomImplWeb) => Promise<void>
}

const FALLBACK = VDomImplWeb.of('inferno')

const init = (input: { keyValueDb: IKeyValueDb }): IVdomImplWebStorage => {
  const KEY = 'vdomImplWeb'
  return {
    async get() {
      const gotClientSessionId = await input.keyValueDb.get(KEY, s.str())

      if (isErr(gotClientSessionId)) {
        return FALLBACK
      }

      const maybeClientSessionId = gotClientSessionId.value

      if (!maybeClientSessionId) return FALLBACK

      const vdomImplWeb = VDomImplWeb.from(maybeClientSessionId)

      if (!vdomImplWeb) return FALLBACK

      return vdomImplWeb
    },

    async set(vdomImplWeb: VDomImplWeb) {
      await input.keyValueDb.set(KEY, vdomImplWeb)
    },
  }
}

export const VdomImplWebStorage = {
  init,
}
