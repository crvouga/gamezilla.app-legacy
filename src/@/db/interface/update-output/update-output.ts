import { Result } from '~/@/result'
import { s } from '~/@/schema'
import { DbErr } from '../error'

export const schema = <TEntity>(_entity: s.Schema<TEntity>) => {
  return Result.schema(DbErr.schema, s.l(null))
}

export type UpdateOutput<TEntity> = s.Infer<ReturnType<typeof schema<TEntity>>>

export const UpdateOutput = {
  schema,
}
