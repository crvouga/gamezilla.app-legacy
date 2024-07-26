import { Result } from '../core'
import { Query } from './query'

export type QueryableDb<TRow> = {
  query: (query: Query<TRow>) => Promise<Result<string, TRow>>
  put: (row: TRow[]) => Promise<Result<string, null>>
}
