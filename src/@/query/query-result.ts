import { Paginated } from '../pagination/paginated'

export type QueryResult<
  TQuery extends Record<string, unknown>,
  TEntity extends Record<string, unknown>,
  TEntityId extends string,
> = {
  query: TQuery
  entities: { [id in TEntityId]: TEntity }
  results: Paginated<TEntityId>
}
