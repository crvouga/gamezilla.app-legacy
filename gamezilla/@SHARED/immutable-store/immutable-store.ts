export type StoreInstance<_TKey, _TValue> = {
  timestamp: number;
  // parentId: string | null;
  // id: string;
  instanceStep: number;
  appendStep: number;
};

export type Store<TKey extends string | number, TValue> = {
  init: (timestamp: number) => StoreInstance<TKey, TValue>;

  assoc: (
    timestamp: number,
    instance: StoreInstance<TKey, TValue>,
    key: TKey,
    value: TValue
  ) => Promise<StoreInstance<TKey, TValue>>;

  assocMany: (
    timestamp: number,
    instance: StoreInstance<TKey, TValue>,
    entries: [TKey, TValue][]
  ) => Promise<StoreInstance<TKey, TValue>>;

  dissoc: (
    timestamp: number,
    instance: StoreInstance<TKey, TValue>,
    key: TKey
  ) => Promise<StoreInstance<TKey, TValue>>;

  dissocMany: (
    timestamp: number,
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
  listLatest: (
    from: number,
    to: number,
    instance: StoreInstance<TKey, TValue>
  ) => Promise<TValue[]>;
};
