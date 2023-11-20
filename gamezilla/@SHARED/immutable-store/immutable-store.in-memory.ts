import { IStore, StoreInstance } from "./immutable-store";

export type MapEntry<TKey extends string | number, TValue> = StoreInstance<
  TKey,
  TValue
> & {
  key: TKey;
  value: TValue | undefined;
};

export const InMemoryStore = <TKey extends string | number, TValue>({
  maxEntryCount,
}: {
  maxEntryCount: number;
}): IStore<TKey, TValue> & {
  toJSON: () => unknown;
} => {
  const map = new Map<TKey, MapEntry<TKey, TValue>[]>();

  let runningAppendStep = 1;

  const append = async (
    now: number,
    instance: StoreInstance<TKey, TValue>,
    entries: [TKey, TValue | undefined][]
  ): Promise<StoreInstance<TKey, TValue>> => {
    const instanceNew: StoreInstance<TKey, TValue> = {
      _timestamp: now,
      _instanceStep: instance._instanceStep + 1,
      _appendStep: runningAppendStep++,
    };

    for (const [key, value] of entries) {
      const entry: MapEntry<TKey, TValue> = {
        ...instanceNew,
        key,
        value,
      };

      const keyEntries = map.get(entry.key) ?? [];
      keyEntries.push(entry);
      if (keyEntries.length > maxEntryCount) {
        keyEntries.shift();
      }
      map.set(entry.key, keyEntries);
    }

    return instanceNew;
  };

  return {
    toJSON() {
      const json: { [key: string | number]: MapEntry<TKey, TValue>[] } = {};
      for (const [key, entries] of map.entries()) {
        json[key] = entries;
      }
      return json;
    },
    init(now) {
      return {
        _timestamp: now,
        _instanceStep: 0,
        _appendStep: 0,
      };
    },
    async assoc(now, instance, key, value) {
      return append(now, instance, [[key, value]]);
    },

    async assocMany(now, instance, entries) {
      return append(now, instance, entries);
    },

    async dissoc(now, instance, key) {
      return append(now, instance, [[key, undefined]]);
    },

    async dissocMany(now, instance, keys) {
      return append(
        now,
        instance,
        keys.map((key) => [key, undefined])
      );
    },

    async listLatest(from, to, instance) {
      const latestValues: TValue[] = [];
      for (const key of map.keys()) {
        const value = await this.latest(from, to, instance, key);

        if (!value) {
          continue;
        }

        latestValues.push(value);
      }
      return latestValues;
    },

    async latest(from, to, instance, key) {
      let runningEntry: MapEntry<TKey, TValue> | null = null;

      for (const entry of map.get(key) ?? []) {
        // SKIP entry is too old
        if (entry._timestamp < from) {
          continue;
        }

        // SKIP entry is from the future
        if (entry._timestamp > to) {
          continue;
        }

        // SKIP entry is from the future
        if (entry._instanceStep > instance._instanceStep) {
          continue;
        }

        // SKIP entry is from the future
        if (entry._appendStep > instance._appendStep) {
          continue;
        }

        // KEEP entry exists
        if (!runningEntry) {
          runningEntry = entry;
          continue;
        }

        // KEEP entry is newer
        if (entry._timestamp > runningEntry._timestamp) {
          runningEntry = entry;
          continue;
        }

        // KEEP entry is newer
        if (entry._instanceStep > runningEntry._instanceStep) {
          runningEntry = entry;
          continue;
        }

        // KEEP entry is newer
        if (entry._appendStep > runningEntry._appendStep) {
          runningEntry = entry;
          continue;
        }
      }

      return runningEntry?.value ?? null;
    },
  };
};
