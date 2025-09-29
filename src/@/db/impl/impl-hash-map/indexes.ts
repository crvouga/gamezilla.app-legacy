export type Indexes<TEntity extends Record<string, unknown>> = Map<
  keyof TEntity,
  Map<TEntity[keyof TEntity], Set<TEntity[keyof TEntity]>>
>

const populate = <TEntity extends Record<string, unknown>>(
  indexes: Indexes<TEntity>,
  e: TEntity,
  primaryKey: keyof TEntity,
) => {
  for (const key in e) {
    if (!indexes.has(key)) {
      indexes.set(key, new Map())
    }

    const valueIndexes = indexes.get(key)!

    const value = e[key]

    if (!valueIndexes.has(value)) {
      valueIndexes.set(value, new Set())
    }

    const primaryKeys = valueIndexes.get(value)!

    primaryKeys.add(e[primaryKey])
  }
}

export const Indexes = {
  populate,
}
