export type Store<_TKey, _TValue> = {
  _unix_msTimestamp: number
  _instanceStep: number
  _appendStep: number
}

export type StoreModule<TKey extends string | number, TValue> = {
  startingAt: (unixMs: number) => Store<TKey, TValue>

  assoc: (unixMs: number, instance: Store<TKey, TValue>, key: TKey, value: TValue) => Promise<Store<TKey, TValue>>

  assocMany: (unixMs: number, instance: Store<TKey, TValue>, entries: [TKey, TValue][]) => Promise<Store<TKey, TValue>>

  dissoc: (unixMs: number, instance: Store<TKey, TValue>, key: TKey) => Promise<Store<TKey, TValue>>

  dissocMany: (unixMs: number, instance: Store<TKey, TValue>, keys: TKey[]) => Promise<Store<TKey, TValue>>

  /**
   * Returns the latest value for the given key, if it exists.
   */
  get: (instance: Store<TKey, TValue>, key: TKey) => Promise<TValue | null>

  /**
   * Returns a list of all values in the store that exist between the given
   * timestamps.
   */
  listLatest: (unixMsFrom: number, unixMsTo: number, instance: Store<TKey, TValue>, log?: boolean) => Promise<TValue[]>
}
