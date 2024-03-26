import { Ok } from "gamezilla-app/@SHARED/core"
import { IDbConnKv } from "./db-conn-kv"

const hashMap = new Map<string, unknown>()

export const DbConnKvHashMap = (): IDbConnKv => {
  return {
    async get(key, parser) {
      const got = hashMap.get(key)

      const parsed = parser.parse(got)

      if (parsed.t === "ok") {
        return Ok(parsed.value)
      }

      return Ok(null)
    },

    async set(key, value) {
      hashMap.set(key, value)
      return Ok(null)
    },

    async zap(key) {
      hashMap.delete(key)
      return Ok(null)
    },
  }
}
