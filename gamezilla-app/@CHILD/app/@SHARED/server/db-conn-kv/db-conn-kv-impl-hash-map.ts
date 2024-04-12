import { Ok } from "gamezilla-app/@SHARED/core"
import { IDbConnKv } from "./db-conn-kv"

export const DbConnKvHashMap = (config?: {
  map?: Map<string, unknown>
}): IDbConnKv => {
  const hashMap = config?.map ?? new Map<string, unknown>()
  return {
    async get(key, parser) {
      const got = hashMap.get(key)

      const parsed = parser.parse(got)

      if (parsed.t === "ok") {
        return Ok(parsed.value)
      }

      return Ok(null)
    },

    async getMany(keys, parser) {
      const rows = keys.flatMap((key) => {
        const got = hashMap.get(key)

        if (!got) {
          return []
        }

        const parsed = parser.parse(got)

        if (parsed.t === "ok") {
          return [parsed.value]
        }

        return []
      })

      return Ok(rows)
    },

    async set(key, value) {
      hashMap.set(key, value)
      return Ok(null)
    },

    async setMany(entries) {
      for (const entry of entries) {
        hashMap.set(entry[0], entry[1])
      }
      return Ok(null)
    },

    async zap(key) {
      hashMap.delete(key)
      return Ok(null)
    },
  }
}
