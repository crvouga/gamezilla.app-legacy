import { Store, StoreInstance } from "./immutable-store";

export type MapEntry<TKey extends string | number, TValue> = StoreInstance<
  TKey,
  TValue
> & {
  key: TKey;
  value: TValue | undefined;
};

export const createInMemoryStore = <TKey extends string | number, TValue>({
  maxEntryCount,
}: {
  maxEntryCount: number;
}): Store<TKey, TValue> & {
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
      timestamp: now,
      instanceStep: instance.instanceStep + 1,
      appendStep: runningAppendStep++,
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
        timestamp: now,
        instanceStep: 0,
        appendStep: 0,
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

    async list(from, to, instance) {
      const values: TValue[] = [];

      for (const key of map.keys()) {
        for (const entry of map.get(key) ?? []) {
          // SKIP entry is too old
          if (entry.timestamp < from) {
            continue;
          }

          // SKIP entry is from the future
          if (entry.timestamp > to) {
            continue;
          }

          // SKIP entry is from the future
          if (entry.instanceStep > instance.instanceStep) {
            continue;
          }

          // SKIP entry is from the future
          if (entry.appendStep > instance.appendStep) {
            continue;
          }

          if (entry.value) {
            values.push(entry.value);
          }
        }
      }

      // return runningEntry?.value;}
      return values;
    },

    async latest(from, to, instance, key) {
      let runningEntry: MapEntry<TKey, TValue> | undefined = undefined;

      for (const entry of map.get(key) ?? []) {
        // SKIP entry is too old
        if (entry.timestamp < from) {
          continue;
        }

        // SKIP entry is from the future
        if (entry.timestamp > to) {
          continue;
        }

        // SKIP entry is from the future
        if (entry.instanceStep > instance.instanceStep) {
          continue;
        }

        // SKIP entry is from the future
        if (entry.appendStep > instance.appendStep) {
          continue;
        }

        // KEEP entry exists
        if (!runningEntry) {
          runningEntry = entry;
          continue;
        }

        // KEEP entry is newer
        if (entry.timestamp > runningEntry.timestamp) {
          runningEntry = entry;
          continue;
        }

        // KEEP entry is newer
        if (entry.instanceStep > runningEntry.instanceStep) {
          runningEntry = entry;
          continue;
        }

        // KEEP entry is newer
        if (entry.appendStep > runningEntry.appendStep) {
          runningEntry = entry;
          continue;
        }
      }

      return runningEntry?.value;
    },
  };
};
