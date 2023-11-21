export type StoreInstance<_TKey, _TValue> = {
  _posixTimestamp: number;
  _instanceStep: number;
  _appendStep: number;
};

export type IStore<TKey extends string | number, TValue> = {
  init: (posix: number) => StoreInstance<TKey, TValue>;

  assoc: (
    posix: number,
    instance: StoreInstance<TKey, TValue>,
    key: TKey,
    value: TValue
  ) => Promise<StoreInstance<TKey, TValue>>;

  assocMany: (
    posix: number,
    instance: StoreInstance<TKey, TValue>,
    entries: [TKey, TValue][]
  ) => Promise<StoreInstance<TKey, TValue>>;

  dissoc: (
    posix: number,
    instance: StoreInstance<TKey, TValue>,
    key: TKey
  ) => Promise<StoreInstance<TKey, TValue>>;

  dissocMany: (
    posix: number,
    instance: StoreInstance<TKey, TValue>,
    keys: TKey[]
  ) => Promise<StoreInstance<TKey, TValue>>;

  /**
   * Returns the latest value for the given key, if it exists.
   */
  latest: (
    posixFrom: number,
    posixTo: number,
    instance: StoreInstance<TKey, TValue>,
    key: TKey
  ) => Promise<TValue | null>;

  /**
   * Returns a list of all values in the store that exist between the given
   * timestamps.
   */
  listLatest: (
    posixFrom: number,
    posixTo: number,
    instance: StoreInstance<TKey, TValue>,
    log?: boolean
  ) => Promise<TValue[]>;
};
