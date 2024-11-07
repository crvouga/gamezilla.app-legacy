export type Store<_TKey, _TValue> = {
  _posixTimestamp: number
  _instanceStep: number
  _appendStep: number
}

export type StoreModule<TKey extends string | number, TValue> = {
  startingAt: (posix: number) => Store<TKey, TValue>

  assoc: (posix: number, instance: Store<TKey, TValue>, key: TKey, value: TValue) => Promise<Store<TKey, TValue>>

  assocMany: (posix: number, instance: Store<TKey, TValue>, entries: [TKey, TValue][]) => Promise<Store<TKey, TValue>>

  dissoc: (posix: number, instance: Store<TKey, TValue>, key: TKey) => Promise<Store<TKey, TValue>>

  dissocMany: (posix: number, instance: Store<TKey, TValue>, keys: TKey[]) => Promise<Store<TKey, TValue>>

  /**
   * Returns the latest value for the given key, if it exists.
   */
  get: (instance: Store<TKey, TValue>, key: TKey) => Promise<TValue | null>

  /**
   * Returns a list of all values in the store that exist between the given
   * timestamps.
   */
  listLatest: (posixFrom: number, posixTo: number, instance: Store<TKey, TValue>, log?: boolean) => Promise<TValue[]>
}
