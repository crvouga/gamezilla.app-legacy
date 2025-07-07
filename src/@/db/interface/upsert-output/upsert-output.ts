import { Result } from '~/@/result'
import { s } from '~/@/schema'
import { DbErr } from '../error'

export const schema = <TEntity>(entity: s.Schema<TEntity>) => {
  return Result.schema(
    DbErr.schema,
    s.obj({
      entities: s.arr(entity),
    }),
  )
}

export type UpsertOutput<TEntity> = s.Infer<ReturnType<typeof schema<TEntity>>>

export const UpsertOutput = {
  schema,
}
