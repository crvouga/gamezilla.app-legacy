import { IDbConnSql } from '~/@/db-conn-sql'
import { p } from '~/@/parser'
import { isErr, Ok } from '~/@/result'
import { Sql } from '~/@/sql'
import { Posix } from '~/@/time/posix'
import { Solutions } from '../solutions'
import { ISolutionsDb } from './interface'

export type Config = {
  t: 'db-conn-sql'
  dbConnSql: IDbConnSql
}

const Row = p.obj({
  flow_hash: p.str,
  solutions: p.json,
  created_at_posix: p.maybe(Posix),
  last_updated_at_posix: p.maybe(Posix),
})

export type Row = p.Infer<typeof Row>

export const SolutionsDb = (config: Config): ISolutionsDb => {
  return {
    async get(hash) {
      const queried = await config.dbConnSql.query({
        parser: Row,
        sql: `
          SELECT flow_hash, solutions 
          FROM game_flow_solutions 
          WHERE flow_hash = :flow_hash
        `,
        vars: {
          flow_hash: hash,
        },
      })

      if (isErr(queried)) return queried

      // const row = queried.value[0]
      return Ok({})
      // if (!row) return Ok({})

      // const parsed = Solutions.parse(row.solutions)

      // if (isErr(parsed)) return parsed

      // return Ok({ [hash]: parsed.value })
    },

    async put(solutions) {
      for (const [hash, sols] of Solutions.iter(solutions)) {
        const now = Posix.now()

        const result = await config.dbConnSql.query({
          parser: Row,
          sql: `
          INSERT INTO game_flow_solutions (
            flow_hash,
            solutions,
            created_at_posix,
            last_updated_at_posix
          )
          VALUES (
            :flow_hash,
            :solutions,
            :created_at_posix,
            :last_updated_at_posix
          )
          ON CONFLICT (flow_hash) DO UPDATE SET
            solutions = :solutions,
            last_updated_at_posix = :last_updated_at_posix
        `,
          vars: {
            flow_hash: hash,
            solutions: Sql.json(sols),
            created_at_posix: now,
            last_updated_at_posix: now,
          },
        })

        if (isErr(result)) return result
      }

      return Ok(null)
    },
  }
}
