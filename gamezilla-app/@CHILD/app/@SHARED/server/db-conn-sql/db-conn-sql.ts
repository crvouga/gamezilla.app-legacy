import { Result } from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/parser"

export type DbConnSql = {
  query: <TRow>(
    parser: p.Parser<TRow>,
    rawSql: string,
    params: {
      [key: string]:
        | number
        | string
        | boolean
        | null
        | undefined
        | Record<string, unknown>
    },
  ) => Promise<Result<string, TRow[]>>
}
