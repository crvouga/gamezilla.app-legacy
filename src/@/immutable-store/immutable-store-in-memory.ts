import type { Store, StoreModule } from './immutable-store'

export type MapEntry<TKey extends string | number, TValue> = Store<TKey, TValue> & {
  key: TKey
  value: TValue | undefined
}

const mapsByNamespace = new Map<string, Map<string | number, MapEntry<string | number, unknown>[]>>()

export const InMemoryStore = <TKey extends string | number, TValue>({
  keySpace,
  maxEntryCount,
  encodeValue,
  decodeValue,
}: {
  keySpace: string
  maxEntryCount: number
  encodeValue: (value: TValue) => unknown
  decodeValue: (value: unknown) => TValue | null
}): StoreModule<TKey, TValue> & {
  toJSON: () => unknown
} => {
  const getMap = () => {
    const map = mapsByNamespace.get(keySpace)

    if (map) {
      return map
    }

    const mapNew = new Map<string | number, MapEntry<string | number, unknown>[]>()

    mapsByNamespace.set(keySpace, mapNew)

    return mapNew
  }

  const setMap = (map: Map<string | number, MapEntry<string | number, unknown>[]>) => {
    mapsByNamespace.set(keySpace, map)
  }

  const decodeEntry = (encodedEntry: MapEntry<string | number, unknown>): MapEntry<TKey, TValue> | null => {
    const value = encodedEntry.value ? decodeValue(encodedEntry.value) : undefined

    if (!value) {
      return null
    }

    return {
      _appendStep: encodedEntry._appendStep,
      _instanceStep: encodedEntry._instanceStep,
      _unix_msTimestamp: encodedEntry._unix_msTimestamp,
      key: encodedEntry.key as TKey,
      value,
    }
  }

  let runningAppendStep = 1

  const append = async (
    now: number,
    instance: Store<TKey, TValue>,
    entries: [TKey, TValue | undefined][],
  ): Promise<Store<TKey, TValue>> => {
    const instanceNew: Store<TKey, TValue> = {
      _unix_msTimestamp: now,
      _instanceStep: instance._instanceStep + 1,
      _appendStep: runningAppendStep++,
    }

    const map = getMap()

    for (const [key, value] of entries) {
      const entry: MapEntry<string | number, unknown> = {
        ...instanceNew,
        key,
        value: value ? encodeValue(value) : undefined,
      }

      const keyEntries = map.get(entry.key) ?? []

      keyEntries.push(entry)

      if (keyEntries.length > maxEntryCount) {
        keyEntries.shift()
      }

      map.set(entry.key, keyEntries)
    }
    setMap(map)

    return instanceNew
  }

  return {
    toJSON() {
      const json: {
        [key: string | number]: MapEntry<TKey, TValue>[]
      } = {}

      return json
    },
    startingAt(now) {
      return {
        _unix_msTimestamp: now,
        _instanceStep: 0,
        _appendStep: 0,
      }
    },
    async assoc(now, instance, key, value) {
      return append(now, instance, [[key, value]])
    },

    async assocMany(now, instance, entries) {
      return append(now, instance, entries)
    },

    async dissoc(now, instance, key) {
      return append(now, instance, [[key, undefined]])
    },

    async dissocMany(now, instance, keys) {
      return append(
        now,
        instance,
        keys.map((key) => [key, undefined]),
      )
    },

    async listLatest(_from, _to, instance) {
      const latestValues: TValue[] = []

      const map = getMap()

      for (const key of map.keys()) {
        const value = await this.get(instance, key as TKey)

        if (!value) {
          continue
        }

        latestValues.push(value)
      }
      return latestValues
    },

    async get(instance, key) {
      let runningEntry: MapEntry<TKey, TValue> | null = null

      const map = getMap()

      for (const encoded of map.get(key) ?? []) {
        const entry = decodeEntry(encoded)

        if (!entry) {
          continue
        }

        // SKIP entry is from the future
        if (entry._unix_msTimestamp > instance._unix_msTimestamp) {
          continue
        }

        // SKIP entry is from the future
        if (entry._instanceStep > instance._instanceStep) {
          continue
        }

        // SKIP entry is from the future
        if (entry._appendStep > instance._appendStep) {
          continue
        }

        // KEEP entry exists
        if (!runningEntry) {
          runningEntry = entry
          continue
        }

        // KEEP entry is newer
        if (entry._unix_msTimestamp > runningEntry._unix_msTimestamp) {
          runningEntry = entry
          continue
        }

        // KEEP entry is newer
        if (entry._instanceStep > runningEntry._instanceStep) {
          runningEntry = entry
          continue
        }

        // KEEP entry is newer
        if (entry._appendStep > runningEntry._appendStep) {
          runningEntry = entry
        }
      }

      return runningEntry?.value ?? null
    },
  }
}
