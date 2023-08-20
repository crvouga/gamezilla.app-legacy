export type ImmutableStore<TKey extends string | number, TValue> = {
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

export type ImmutableStoreInstance<TKey, TValue> = {
  timestamp: number;
  instanceStep: number;
  appendStep: number;
};

export const init = <TKey extends string | number, TValue>(
  timestamp: number
): ImmutableStoreInstance<TKey, TValue> => {
  return {
    // used for out-of-process ordering
    timestamp,
    // used for in-process ordering
    instanceStep: 0,
    appendStep: 0,
  };
};
