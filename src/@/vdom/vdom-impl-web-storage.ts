import { IKeyValueDb } from '../key-value-db'
import { isErr } from '../result'
import { s } from '../schema'
import { VDomImplWeb } from './vdom-impl-web'

export type IVdomImplWebStorage = {
  get: () => Promise<VDomImplWeb>
  set: (vdomImplWeb: VDomImplWeb) => Promise<void>
}

const init = (input: { keyValueDb: IKeyValueDb; fallback: VDomImplWeb }): IVdomImplWebStorage => {
  const KEY = 'vdomImplWeb'
  const fallback = input.fallback
  return {
    async get() {
      const gotClientSessionId = await input.keyValueDb.get(KEY, s.str())

      if (isErr(gotClientSessionId)) {
        return fallback
      }

      const maybeClientSessionId = gotClientSessionId.value

      if (!maybeClientSessionId) return fallback

      const vdomImplWeb = VDomImplWeb.from(maybeClientSessionId)

      if (!vdomImplWeb) return fallback

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
