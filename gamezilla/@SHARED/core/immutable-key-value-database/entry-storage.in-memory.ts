import { MapEntry, EntryStorage } from "./immutable-key-value-database";

export const createEntryStorage = <T>(): EntryStorage<T> => {
  const entries = new Map<string, MapEntry<T>[]>();

  return {
    async get(key) {
      return entries.get(key) ?? [];
    },
    async add(entry) {
      const keyEntries = entries.get(entry.key) ?? [];
      keyEntries.push(entry);
      entries.set(entry.key, keyEntries);
    },
  };
};
