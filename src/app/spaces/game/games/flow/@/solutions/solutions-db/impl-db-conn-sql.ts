import { IDbConnSql } from '~/@/db-conn-sql'
import { Json } from '~/@/json/json'
import { p } from '~/@/parser'
import { Err, isErr, Ok, unwrapOr } from '~/@/result'
import { Sql } from '~/@/sql'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { Solution } from '../solution'
import { Solutions } from '../solutions'
import { ISolutionsDb } from './interface'

export type Config = {
  t: 'db-conn-sql'
  dbConnSql: IDbConnSql
}

const Row = p.obj({
  id: p.str,
  solutions: p.or(p.str, p.json),
  created_at_posix: p.maybe(Posix),
  last_updated_at_posix: p.maybe(Posix),
})

export type Row = p.Infer<typeof Row>

const rowToSolutions = (row: Row): Solutions | null => {
  const json = unwrapOr(typeof row.solutions === 'string' ? Json.parse(row.solutions) : Ok(row.solutions), [])
  return p.arr(Solution).parse(json)
}

export const SolutionsDb = (config: Config): ISolutionsDb => {
  return {
    async get(hash) {
      const queried = await config.dbConnSql.query({
        parser: Row,
        sql: `
          SELECT id, solutions 
          FROM game_flow_solutions 
          WHERE id = :id
        `,
        vars: {
          id: hash,
        },
      })

      if (isErr(queried)) return queried

      const row = queried.value[0]

      if (!row) return Ok({})

      const json = unwrapOr(typeof row.solutions === 'string' ? Json.parse(row.solutions) : Ok(row.solutions), [])

      const parsed = p.arr(Solution).parse(json)

      if (isErr(parsed)) return Err(parsed.error.map((e) => e.message).join('\n'))

      const solutions: Solutions = { [hash]: parsed.value }

      return Ok(solutions)
    },

    async put(solutions) {
      for (const [hash, sols] of Solutions.iter(solutions)) {
        const now = Posix.now()

        const result = await config.dbConnSql.query({
          parser: Row,
          sql: `
          INSERT INTO game_flow_solutions (
            id,
            solutions,
            created_at_posix,
            last_updated_at_posix
          )
          VALUES (
            :id,
            :solutions,
            :created_at_posix,
            :last_updated_at_posix
          )
          ON CONFLICT (id) DO UPDATE SET
            solutions = :solutions,
            last_updated_at_posix = :last_updated_at_posix
        `,
          vars: {
            id: hash,
            solutions: Sql.json(sols),
            created_at_posix: now,
            last_updated_at_posix: now,
          },
        })

        if (isErr(result)) return result
      }

      return Ok(null)
    },

    async zap(hash) {
      const result = await config.dbConnSql.query({
        parser: p.unknown,
        sql: `DELETE FROM game_flow_solutions WHERE id = :id`,
        vars: { id: hash },
      })

      if (isErr(result)) return result

      return Ok(null)
    },

    sub(hash) {
      return Sub.map(
        config.dbConnSql.sub({
          parser: Row,
          sql: `
            SELECT
              id,
              solutions,
              created_at_posix,
              last_updated_at_posix
            FROM
              game_flow_solutions
            WHERE
              id = :id
          `,
          vars: { id: hash },
        }),
        (rows) => {
          return (
            rows.flatMap((row) => {
              const solutions = rowToSolutions(row)
              return solutions ? [solutions] : []
            })[0] ?? null
          )
        },
      )
    },
  }
}
