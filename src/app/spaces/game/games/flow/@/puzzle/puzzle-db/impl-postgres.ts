import type { IDbConnSql } from '~/@/db-conn-sql'
import type { ILogger } from '~/@/logger'
import { p } from '~/@/parser'
import { Pagination } from '~/@/query/query'
import { Err, Ok, Result, isErr } from '~/@/result'
import { Sql } from '~/@/sql'
import { Posix } from '~/@/time/posix'
import { Solutions } from '../../solutions/solutions'
import type { Puzzle } from '../puzzle'
import type { IPuzzleDb, OrderClause, WhereClause } from './interface'
import { PostgresRow } from './postgres/row'

export const PuzzleDbPostgres = (config: { logger: ILogger; dbConnSql: IDbConnSql }): IPuzzleDb => {
  return {
    async get(flowPuzzleId) {
      const queried = await config.dbConnSql.query(
        PostgresRow,
        `
				SELECT
					*
				FROM
					game_flow_puzzle
				WHERE
						flow_puzzle_id = :flow_puzzle_id
					AND deleted_at IS NULL
				LIMIT 1
				`,
        {
          flow_puzzle_id: flowPuzzleId,
        },
      )

      if (isErr(queried)) {
        return queried
      }

      const queriedPuzzle = queried.value.map(async (row): Promise<Puzzle[]> => {
        const flowPuzzle = PostgresRow.rowToPuzzle(row)
        if (!flowPuzzle) {
          return []
        }
        return [flowPuzzle]
      })

      const awaited = await Promise.all(queriedPuzzle)

      const flowPuzzles = awaited.flat()

      return Ok(flowPuzzles[0] ?? null)
    },

    async count(input) {
      const where = toSqlWhere(input)

      const queried = await config.dbConnSql.query(
        p.obj({
          count: p.str,
        }),
        `
				SELECT
					COUNT(*) AS count
				FROM
					game_flow_puzzle
					${where.str}
				`,
        where.variables,
      )
      return Result.mapOk(queried, (x) => Number.parseFloat(x[0]?.count ?? '0'))
    },

    async query(input) {
      const where = toSqlWhere(input)
      const order = toSqlOrder(input)
      const pagination = toSqlPagination(input)

      const variables: Sql.Vars = {
        ...where.variables,
        ...pagination.variables,
      }

      const queried = await config.dbConnSql.query(
        PostgresRow,
        `
				SELECT
					*
				FROM
					game_flow_puzzle
				${where.str}
				${order.str}
				${pagination.str}
				`,
        variables,
      )

      if (isErr(queried)) {
        return queried
      }

      const queriedCount = await config.dbConnSql.query(
        p.obj({
          count: p.str,
        }),
        `
				SELECT
					COUNT(*) AS count
				FROM
					game_flow_puzzle
				${where.str}
				`,
        variables,
      )

      if (isErr(queriedCount)) {
        return queriedCount
      }

      const queriedPuzzle = queried.value.map(async (row): Promise<Puzzle[]> => {
        const flowPuzzle = PostgresRow.rowToPuzzle(row)
        if (!flowPuzzle) {
          return []
        }
        return [flowPuzzle]
      })

      const awaited = await Promise.all(queriedPuzzle)

      const flowPuzzles = awaited.flat()

      const total = Number.parseFloat(queriedCount.value[0]?.count ?? '0') ?? 0

      return Ok({
        puzzles: {
          items: flowPuzzles,
          total: total,
          limit: input.pagination.limit,
          offset: input.pagination.offset,
        },
        solutions: Solutions.init,
      })
    },

    async put(flowPuzzle) {
      const queried = await config.dbConnSql.query(
        p.unknown,
        `
				INSERT INTO game_flow_puzzle (
					flow_puzzle_id,
					flow_puzzle_name,
					flow,
					created_at_posix,
					created_by_user_id,
					last_updated_at_posix,
					last_updated_by_user_id,
					flow_solutions
				)
				VALUES (
					:flow_puzzle_id,
					:flow_puzzle_name,
					:flow,
					:created_at_posix,
					:created_by_user_id,
					:last_updated_at_posix,
					:last_updated_by_user_id,
					:flow_solutions
				) ON CONFLICT (flow_puzzle_id) DO
				UPDATE SET
					flow_puzzle_name = :flow_puzzle_name,
					flow = :flow,
					last_updated_at_posix = :last_updated_at_posix,
					last_updated_by_user_id = :last_updated_by_user_id,
					flow_solutions = :flow_solutions
				`,
        {
          flow_puzzle_id: flowPuzzle.id,
          flow_puzzle_name: flowPuzzle.name,
          flow: Sql.json(flowPuzzle.flow),
          flow_solutions: Sql.json(flowPuzzle.solutions),
          created_at_posix: flowPuzzle.createdAt,
          created_by_user_id: flowPuzzle.createdBy,
          last_updated_at_posix: flowPuzzle.lastUpdatedAt,
          last_updated_by_user_id: flowPuzzle.lastUpdatedBy,
        },
      )
      return Result.mapOk(queried, () => null)
    },

    async zap(input) {
      const queried = await config.dbConnSql.query(
        p.num,
        `
				UPDATE
					game_flow_puzzle
				SET
					deleted_at = :deleted_at,
					deleted_by_user_id = :deleted_by_user_id
				WHERE
					flow_puzzle_id = :flow_puzzle_id
				`,
        {
          deleted_at: Posix.now(),
          deleted_by_user_id: input.deletedByUserId,
          flow_puzzle_id: input.id,
        },
      )
      return Result.mapOk(queried, () => null)
    },

    async subscribe(_input) {
      return Err('not implemented')
    },
  }
}

const toSqlWhere = (input: { where: WhereClause }) => {
  const variables: Sql.Vars = {}
  const where: string[] = [
    //
    'deleted_at IS NULL',
  ]

  if (input.where.createdBy?.equals) {
    where.push('created_by_user_id = :created_by_user_id')
    variables.created_by_user_id = input.where.createdBy?.equals
  }

  if (input.where.puzzleId?.in) {
    if (input.where.puzzleId?.in.length > 0) {
      const puzzleIds = input.where.puzzleId?.in.map((puzzleId) => `'${puzzleId}'`).join(', ')
      where.push(`flow_puzzle_id IN (${puzzleIds})`)
    } else {
      where.push('FALSE')
    }
  }

  const str = where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''

  return {
    str,
    variables,
  }
}

const toSqlOrder = (input: { order: OrderClause }) => {
  const orderBy: string[] = []

  if (input.order.createdAt) {
    orderBy.push(`created_at_posix ${input.order.createdAt === 'desc' ? 'DESC' : 'ASC'}`)
  }

  if (input.order.lastUpdatedAt) {
    orderBy.push(`last_updated_at_posix ${input.order.lastUpdatedAt === 'desc' ? 'DESC' : 'ASC'}`)
  }

  const str = orderBy.length > 0 ? `ORDER BY ${orderBy.join(', ')}` : ''

  return {
    str,
  }
}

const toSqlPagination = (input: { pagination: Pagination }) => {
  const variables: Sql.Vars = {
    limit: input.pagination.limit,
    offset: input.pagination.offset,
  }
  const str = 'LIMIT :limit OFFSET :offset'
  return {
    variables,
    str,
  }
}
