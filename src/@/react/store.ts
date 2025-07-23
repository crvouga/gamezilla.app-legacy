import { useSyncExternalStore } from 'react'

export type IStore<T> = {
  getSnapshot: () => T
  subscribe: (onStoreChange: () => void) => () => void
  update: (newValue: T) => void
}

export const Store = <T>(initialValue: T): IStore<T> => {
  let value: T = initialValue
  const onStoreChangeSet = new Set<() => void>()
  return {
    getSnapshot() {
      return value
    },
    subscribe(onStoreChange) {
      onStoreChangeSet.add(onStoreChange)
      return () => onStoreChangeSet.delete(onStoreChange)
    },
    update(newValue: T) {
      value = newValue
      onStoreChangeSet.forEach((l) => l())
    },
  }
}

export const StoreSingleListener = <T>(initialValue: T): IStore<T> => {
  let value: T = initialValue
  let onStoreChange_: (() => void) | null = null
  return {
    getSnapshot() {
      return value
    },
    subscribe(onStoreChange) {
      onStoreChange_ = onStoreChange
      return () => {
        onStoreChange_ = null
      }
    },
    update(newValue: T) {
      value = newValue
      onStoreChange_?.()
    },
  }
}

export const useStore = <T>(store: IStore<T>) => {
  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}
