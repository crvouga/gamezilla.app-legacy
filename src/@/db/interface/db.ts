import { s } from '~/@/schema'
import { Sub } from '~/@/sub'
import { QueryInput } from './query-input/query-input'
import { QueryOutput } from './query-output/query-output'
import { DeleteInput } from './delete-input/delete-input'
import { DeleteOutput } from './delete-output/delete-output'
import { UpdateInput } from './update-input/update-input'
import { UpdateOutput } from './update-output/update-output'
import { UpsertInput } from './upsert-input/upsert-input'
import { UpsertOutput } from './upsert-output/upsert-output'

export type Parser<TEntity extends Record<string, unknown>, TRelated extends Record<string, unknown>> = {
  Entity: s.Schema<TEntity>
  Related: s.Schema<TRelated>
  QueryInput: s.Schema<QueryInput<TEntity>>
  QueryOutput: s.Schema<QueryOutput<TEntity, TRelated>>
  UpsertInput: s.Schema<UpsertInput<TEntity>>
  UpsertOutput: s.Schema<UpsertOutput<TEntity>>
}

export const schema = <TEntity extends Record<string, unknown>, TRelated extends Record<string, unknown>>(config: {
  Entity: s.Schema<TEntity>
  Related: s.Schema<TRelated>
}): Parser<TEntity, TRelated> => {
  return {
    Entity: config.Entity,
    Related: config.Related,
    QueryInput: QueryInput.schema(config.Entity),
    QueryOutput: QueryOutput.schema(config.Entity, config.Related),
    UpsertInput: UpsertInput.schema(config.Entity),
    UpsertOutput: UpsertOutput.schema(config.Entity),
  }
}

export type Infer<T> =
  T extends Parser<infer TEntity extends Record<string, unknown>, infer TRelated extends Record<string, unknown>>
    ? IDb<TEntity, TRelated>
    : never

export type InferQueryInput<T> =
  T extends Parser<infer TEntity extends Record<string, unknown>, infer _TRelated> ? QueryInput<TEntity> : never

export type InferQueryOutput<T> =
  T extends Parser<infer TEntity, infer TRelated> ? QueryOutput<TEntity, TRelated> : never

export type InferUpsertInput<T> = T extends Parser<infer TEntity, infer _TRelated> ? UpsertInput<TEntity> : never

export type InferUpsertOutput<T> = T extends Parser<infer TEntity, infer _TRelated> ? UpsertOutput<TEntity> : never

export type IDb<TEntity extends Record<string, unknown>, TRelated extends Record<string, unknown>> = {
  query: (query: QueryInput<TEntity>) => Promise<QueryOutput<TEntity, TRelated>>
  liveQuery: <TMsg>(query: QueryInput<TEntity>, map: (output: QueryOutput<TEntity, TRelated>) => TMsg) => Sub<TMsg>
  upsert: (input: UpsertInput<TEntity>) => Promise<UpsertOutput<TEntity>>
  update: (input: UpdateInput<TEntity>) => Promise<UpdateOutput<TEntity>>
  delete: (input: DeleteInput<TEntity>) => Promise<DeleteOutput<TEntity>>
  extra: unknown
}
