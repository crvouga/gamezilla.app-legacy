import { s } from '~/@/schema'

export const schema = <TEntity>(entity: s.Schema<TEntity>) => {
  return s.obj({
    entities: s.arr(entity),
  })
}

export type UpsertInput<TEntity> = s.Infer<ReturnType<typeof schema<TEntity>>>

export const UpsertInput = {
  schema,
}
