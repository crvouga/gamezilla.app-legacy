import { s } from '../schema'

export type CappedOrderedDict<TKey extends string | number, TValue> = {
  _valuesByKey: {
    [key in TKey]?: TValue
  }
  _orderNewestFirst: TKey[]
  _maxSize: number
}

const init = <TKey extends string | number, TValue>({
  maxSize,
}: {
  maxSize: number
}): CappedOrderedDict<TKey, TValue> => {
  return {
    _valuesByKey: {},
    _maxSize: maxSize,
    _orderNewestFirst: [],
  }
}

const add = <TKey extends string | number, TValue>(
  model: CappedOrderedDict<TKey, TValue>,
  key: TKey,
  item: TValue,
): CappedOrderedDict<TKey, TValue> => {
  const orderNewestFirstNew = [key, ...model._orderNewestFirst]
  const valuesByKeyNew = {
    ...model._valuesByKey,
    [key]: item,
  }

  if (orderNewestFirstNew.length > model._maxSize) {
    delete valuesByKeyNew[orderNewestFirstNew.pop()!]
  }

  return {
    _valuesByKey: valuesByKeyNew,
    _maxSize: model._maxSize,
    _orderNewestFirst: orderNewestFirstNew,
  }
}

const remove = <TKey extends string | number, TValue>(
  model: CappedOrderedDict<TKey, TValue>,
  key: TKey,
): CappedOrderedDict<TKey, TValue> => {
  if (!(key in model._valuesByKey)) {
    return model
  }
  const valuesByKeyNew = { ...model._valuesByKey }
  const orderIndex = model._orderNewestFirst.indexOf(key)
  if (orderIndex === -1) {
    return model
  }
  const orderNewestFirstNew = [
    ...model._orderNewestFirst.slice(0, orderIndex),
    ...model._orderNewestFirst.slice(orderIndex + 1),
  ]
  delete valuesByKeyNew[key]
  return {
    _maxSize: model._maxSize,
    _orderNewestFirst: orderNewestFirstNew,
    _valuesByKey: valuesByKeyNew,
  }
}

const get = <TKey extends string | number, TValue>(
  model: CappedOrderedDict<TKey, TValue>,
  key: TKey,
): TValue | null => {
  return model._valuesByKey[key] ?? null
}

const mergeLeft = <TKey extends string | number, TValue>(
  left: CappedOrderedDict<TKey, TValue>,
  right: CappedOrderedDict<TKey, TValue>,
): CappedOrderedDict<TKey, TValue> => {
  const valuesByKeyNew = { ...left._valuesByKey }
  const orderNewestFirstNew = [...left._orderNewestFirst]

  for (let i = 0; i < right._orderNewestFirst.length; i++) {
    const key = right._orderNewestFirst[i]!
    if (!(key in valuesByKeyNew) && orderNewestFirstNew.length < left._maxSize) {
      valuesByKeyNew[key] = right._valuesByKey[key]
      orderNewestFirstNew.push(key)
    }
  }

  return {
    _maxSize: left._maxSize,
    _orderNewestFirst: orderNewestFirstNew,
    _valuesByKey: valuesByKeyNew,
  }
}
const valuesNewestFirst = <TKey extends string | number, TValue>(model: CappedOrderedDict<TKey, TValue>): TValue[] => {
  const values: TValue[] = []
  for (let i = 0; i < model._orderNewestFirst.length; i++) {
    values.push(model._valuesByKey[model._orderNewestFirst[i]!]!)
  }
  return values
}

const schema = <TKey extends string | number, TValue>(
  key: s.Parser<TKey>,
  val: s.Parser<TValue>,
): s.Parser<CappedOrderedDict<TKey, TValue>> => {
  return s.obj({
    _valuesByKey: s.dict(key, val),
    _orderNewestFirst: s.arr(key),
    _maxSize: s.num(),
  })
}

export const CappedOrderedDict = {
  add,
  remove,
  init,
  get,
  mergeLeft,
  valuesNewestFirst,
  schema,
}
