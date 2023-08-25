export type StoreInstance<_TKey, _TValue> = {
  timestamp: number;
  instanceStep: number;
  appendStep: number;
};

export type Store<TKey extends string | number, TValue> = {
  init: (timestamp: number) => StoreInstance<TKey, TValue>;

  assoc: (
    now: number,
    instance: StoreInstance<TKey, TValue>,
    key: TKey,
    value: TValue
  ) => Promise<StoreInstance<TKey, TValue>>;

  assocMany: (
    now: number,
    instance: StoreInstance<TKey, TValue>,
    entries: [TKey, TValue][]
  ) => Promise<StoreInstance<TKey, TValue>>;

  dissoc: (
    now: number,
    instance: StoreInstance<TKey, TValue>,
    key: TKey
  ) => Promise<StoreInstance<TKey, TValue>>;

  dissocMany: (
    now: number,
    instance: StoreInstance<TKey, TValue>,
    keys: TKey[]
  ) => Promise<StoreInstance<TKey, TValue>>;

  /**
   * Returns the latest value for the given key, if it exists.
   */
  latest: (
    from: number,
    to: number,
    instance: StoreInstance<TKey, TValue>,
    key: TKey
  ) => Promise<TValue | undefined>;

  /**
   * Returns a list of all values in the store that exist between the given
   * timestamps.
   */
  list: (
    from: number,
    to: number,
    instance: StoreInstance<TKey, TValue>
  ) => Promise<TValue[]>;
};
