import { IDbConnSql } from '~/@/db-conn-sql'
import { p } from '~/@/parser'
import { Err } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { ISolutionsDb } from './interface'

export type Config = {
  t: 'postgres'
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
      // const queried = awia config.dbConnSql.query(Row, `SELECT flow_hash, solutions FROM game_flow_solutions WHERE flow_hash = :flow_hash`, {
      //   flow_hash: hash,
      // })
      return Err('not implemented')
    },
    async put(_solutions) {
      return Err('not implemented')
    },
  }
}
