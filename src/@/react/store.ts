import { useSyncExternalStore } from 'react'

export type IStore<T> = {
  get: () => T
  subscribe: (listener: () => void) => () => void
  update: (newValue: T) => void
}

export const Store = <T>(initialValue: T): IStore<T> => {
  let value: T = initialValue
  const listeners = new Set<() => void>()
  return {
    get() {
      return value
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    update(newValue: T) {
      value = newValue
      listeners.forEach((l) => l())
    },
  }
}

export const StoreSingleListener = <T>(initialValue: T): IStore<T> => {
  let value: T = initialValue
  let listener: (() => void) | null = null
  return {
    get() {
      return value
    },
    subscribe(listenerNew) {
      listener = listenerNew
      return () => {
        listener = null
      }
    },
    update(newValue: T) {
      value = newValue
      listener?.()
    },
  }
}

export const useStore = <T>(store: IStore<T>) => {
  return useSyncExternalStore(store.subscribe, store.get)
}
