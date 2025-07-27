export const InMemoryStorage = (): Storage => {
  const storage = new Map<string, string>()
  return {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      storage.set(key, value)
    },
    removeItem: (key) => {
      storage.delete(key)
    },
    clear: () => {
      storage.clear()
    },
    length: 0,
    key: (index) => Array.from(storage.keys())[index] ?? null,
  }
}
