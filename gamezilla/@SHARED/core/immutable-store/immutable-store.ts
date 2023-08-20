export type ImmutableStoreInstance<TKey, TValue> = {
  timestamp: number;
  instanceStep: number;
  appendStep: number;
};

export type ImmutableStore<TKey extends string | number, TValue> = {
  init: (timestamp: number) => ImmutableStoreInstance<TKey, TValue>;

  assoc: (
    instance: ImmutableStoreInstance<TKey, TValue>,
    key: TKey,
    value: TValue
  ) => Promise<ImmutableStoreInstance<TKey, TValue>>;

  assocMany: (
    instance: ImmutableStoreInstance<TKey, TValue>,
    entries: [TKey, TValue][]
  ) => Promise<ImmutableStoreInstance<TKey, TValue>>;

  dissoc: (
    instance: ImmutableStoreInstance<TKey, TValue>,
    key: TKey
  ) => Promise<ImmutableStoreInstance<TKey, TValue>>;

  dissocMany: (
    instance: ImmutableStoreInstance<TKey, TValue>,
    keys: TKey[]
  ) => Promise<ImmutableStoreInstance<TKey, TValue>>;

  get: (
    instance: ImmutableStoreInstance<TKey, TValue>,
    key: TKey
  ) => Promise<TValue | undefined>;

  values: (instance: ImmutableStoreInstance<TKey, TValue>) => Promise<TValue[]>;
};
