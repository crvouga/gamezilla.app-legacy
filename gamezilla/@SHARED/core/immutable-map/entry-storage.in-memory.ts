import { MapEntry, EntryStorage } from "./immutable-map";

export const createEntryStorage = <T>(): EntryStorage<T> => {
  const entries: MapEntry<T>[] = [];

  return {
    async list(key) {
      const subset: MapEntry<T>[] = [];
      for (const entry of entries) {
        if (entry.key === key) {
          subset.push(entry);
        }
      }
      return subset;
    },
    async append(value) {
      entries.push(value);
    },
  };
};
