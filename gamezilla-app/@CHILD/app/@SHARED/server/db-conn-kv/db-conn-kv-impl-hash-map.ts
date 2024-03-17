import { ok } from "gamezilla-app/@SHARED/core"
import { DbConnKv } from "./db-conn-kv"

const hashMap = new Map<string, unknown>()

export const createDbConnKvHashMap = (): DbConnKv => {
  return {
    async get(isValue, key) {
      const got = hashMap.get(key)

      if (isValue(got)) {
        return ok(got)
      }

      return ok(null)
    },

    async set(key, value) {
      hashMap.set(key, value)
      return ok(null)
    },

    async zap(key) {
      hashMap.delete(key)
      return ok(null)
    },
  }
}
