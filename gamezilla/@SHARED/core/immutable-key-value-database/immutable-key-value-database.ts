export type ImmutableKeyValueDatabase<T> = {
  set: (instance: Instance, key: string, value: T) => Promise<Instance>;
  zap: (instance: Instance, key: string) => Promise<Instance>;
  get: (instance: Instance, key: string) => Promise<T | undefined>;
};

export type Instance = {
  timestamp: number;
  instanceStep: number;
  appendStep: number;
};

export const init = (timestamp: number): Instance => {
  return {
    // used for out-of-process ordering
    timestamp,
    // used for in-process ordering
    instanceStep: 0,
    appendStep: 0,
  };
};

export type MapEntry<T> = Instance & {
  key: string;
  value: T | undefined;
};

export type EntryStorage<T> = {
  add: (entry: MapEntry<T>) => Promise<void>;
  get: (key: string) => Promise<MapEntry<T>[] | undefined>;
};

export const createImmutableKeyValueDatabase = <T>(
  storage: EntryStorage<T>
): ImmutableKeyValueDatabase<T> => {
  let runningAppendStep = 1;

  const append = async (
    instance: Instance,
    key: string,
    value: T | undefined
  ): Promise<Instance> => {
    const instanceNew: Instance = {
      timestamp: instance.timestamp,
      instanceStep: instance.instanceStep + 1,
      appendStep: runningAppendStep++,
    };

    const entry: MapEntry<T> = {
      ...instanceNew,
      key,
      value,
    };

    await storage.add(entry);

    return instanceNew;
  };

  return {
    async set(instance, key, value) {
      return append(instance, key, value);
    },

    async zap(instance, key) {
      return append(instance, key, undefined);
    },

    async get(instance, key) {
      let runningEntry: MapEntry<T> | undefined = undefined;

      const entries = await storage.get(key);

      for (const entry of entries ?? []) {
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
