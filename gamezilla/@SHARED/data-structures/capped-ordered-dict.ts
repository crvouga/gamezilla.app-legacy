export type CappedOrderedDict<TKey extends string | number, TValue> = {
  _type: "CappedOrderedDict";
  _valuesByKey: {
    [key in TKey]?: TValue;
  };
  _orderNewestFirst: TKey[];
  _maxSize: number;
};

const init = <TKey extends string | number, TValue>({
  maxSize,
}: {
  maxSize: number;
}): CappedOrderedDict<TKey, TValue> => {
  return {
    _type: "CappedOrderedDict",
    _valuesByKey: {},
    _maxSize: maxSize,
    _orderNewestFirst: [],
  };
};

const add = <TKey extends string | number, TValue>(
  model: CappedOrderedDict<TKey, TValue>,
  key: TKey,
  item: TValue
): CappedOrderedDict<TKey, TValue> => {
  const orderNewestFirstNew = [key, ...model._orderNewestFirst].slice(
    0,
    model._maxSize
  );

  const valuesByKeyNew: CappedOrderedDict<TKey, TValue>["_valuesByKey"] = {};

  valuesByKeyNew[key] = item;

  for (const key of orderNewestFirstNew) {
    if (key in model._valuesByKey) {
      const value = model._valuesByKey[key]!;
      valuesByKeyNew[key] = value;
    }
  }

  return {
    _type: "CappedOrderedDict",
    _valuesByKey: valuesByKeyNew,
    _maxSize: model._maxSize,
    _orderNewestFirst: orderNewestFirstNew,
  };
};

const remove = <TKey extends string | number, TValue>(
  model: CappedOrderedDict<TKey, TValue>,
  key: TKey
): CappedOrderedDict<TKey, TValue> => {
  const valuesByKeyNew = { ...model._valuesByKey };
  delete valuesByKeyNew[key];
  return {
    _type: "CappedOrderedDict",
    _maxSize: model._maxSize,
    _orderNewestFirst: model._orderNewestFirst.filter(
      (existingKey) => existingKey !== key
    ),
    _valuesByKey: valuesByKeyNew,
  };
};

const get = <TKey extends string | number, TValue>(
  model: CappedOrderedDict<TKey, TValue>,
  key: TKey
): TValue | null => {
  return model._valuesByKey[key] ?? null;
};

export const CappedOrderedDict = {
  add,
  remove,
  init,
  get,
};
