import { ISqlDb } from '~/@/sql-db'
import { Json } from '~/@/json/json'
import { s } from '~/@/schema'
import { Err, isErr, Ok, Result, unwrapOr } from '~/@/result'
import { Sql } from '~/@/sql'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { Solutions } from '../solutions'
import { ISolutionsDb } from './interface'

export type Config = {
  t: 'sql-db'
  dbConnSql: ISqlDb
}

const Row = s.obj({
  id: s.str(),
  solutions: s.or(s.str(), s.json),
  created_at_posix: s.maybe(s.or(Posix, s.str())),
  last_updated_at_posix: s.maybe(s.or(Posix, s.str())),
})

export type Row = s.Infer<typeof Row>

const rowToSolutions = (row: Row): Result<string, Solutions> => {
  const json = unwrapOr(typeof row.solutions === 'string' ? Json.parse(row.solutions) : Ok(row.solutions), [])
  const parsed = Solutions.parse(json)
  if (isErr(parsed)) return Err(parsed.error.map((e) => e.message).join('\n'))
  return Ok(parsed.value)
}

export const SolutionsDb = (config: Config): ISolutionsDb => {
  return {
    async get(hash) {
      const queried = await config.dbConnSql.query({
        schema: Row,
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
        vars: {
          id: hash,
        },
      })

      if (isErr(queried)) return queried

      const row = queried.value[0]

      if (!row) return Ok([])

      const solutions = rowToSolutions(row)
      if (isErr(solutions)) return solutions

      return Ok(solutions.value)
    },

    async put(solutions) {
      for (const [hash, sols] of Solutions.groupByHash(solutions)) {
        const got = await this.get(hash)
        if (isErr(got)) {
          return got
        }

        const now = Posix.now()

        if (got.value.length > 0) {
          // Update existing record
          const updateResult = await config.dbConnSql.query({
            schema: s.num(),
            sql: `
            UPDATE game_flow_solutions
            SET
              solutions = :solutions,
              last_updated_at_posix = :lastUpdatedAt
            WHERE
              id = :id
            `,
            vars: {
              id: hash,
              solutions: Sql.json(sols),
              lastUpdatedAt: now,
            },
          })

          if (isErr(updateResult)) {
            return updateResult
          }
        } else {
          // Insert new record
          const insertResult = await config.dbConnSql.query({
            schema: s.unknown,
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
              :createdAt,
              :lastUpdatedAt
            )
            `,
            vars: {
              id: hash,
              solutions: Sql.json(sols),
              createdAt: now,
              lastUpdatedAt: now,
            },
          })

          if (isErr(insertResult)) {
            return insertResult
          }
        }
      }

      return Ok(null)
    },

    async zap(hash) {
      const result = await config.dbConnSql.query({
        schema: s.unknown,
        sql: `DELETE FROM game_flow_solutions WHERE id = :id`,
        vars: { id: hash },
      })

      if (isErr(result)) return result

      return Ok(null)
    },

    sub(hash) {
      return Sub.map(
        config.dbConnSql.sub({
          schema: Row,
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
          return rows.flatMap((row) => {
            const solutions = rowToSolutions(row)
            if (isErr(solutions)) return []
            return solutions.value
          })
        },
      )
    },
  }
}
