import { ImmutableStore, ImmutableStoreInstance } from "./immutable-store";

export type MapEntry<
  TKey extends string | number,
  TValue
> = ImmutableStoreInstance<TKey, TValue> & {
  key: TKey;
  value: TValue | undefined;
};

export const createImmutableStore = <
  TKey extends string | number,
  TValue
>(): ImmutableStore<TKey, TValue> => {
  const map = new Map<TKey, MapEntry<TKey, TValue>[]>();

  let runningAppendStep = 1;

  const append = async (
    instance: ImmutableStoreInstance<TKey, TValue>,
    entries: [TKey, TValue | undefined][]
  ): Promise<ImmutableStoreInstance<TKey, TValue>> => {
    const instanceNew: ImmutableStoreInstance<TKey, TValue> = {
      timestamp: instance.timestamp,
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
      map.set(entry.key, keyEntries);
    }

    return instanceNew;
  };

  return {
    init(timestamp) {
      return {
        timestamp,
        instanceStep: 0,
        appendStep: 0,
      };
    },
    async assoc(instance, key, value) {
      return append(instance, [[key, value]]);
    },

    async assocMany(instance, entries) {
      return append(instance, entries);
    },

    async dissoc(instance, key) {
      return append(instance, [[key, undefined]]);
    },

    async dissocMany(instance, keys) {
      return append(
        instance,
        keys.map((key) => [key, undefined])
      );
    },

    async values(instance) {
      return [];
    },

    async get(instance, key) {
      let runningEntry: MapEntry<TKey, TValue> | undefined = undefined;

      for (const entry of map.get(key) ?? []) {
        // SKIP entry is from the future
        if (entry.timestamp > instance.timestamp) {
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
