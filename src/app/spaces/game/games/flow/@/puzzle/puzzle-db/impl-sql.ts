import type { IDbConnSql } from '~/@/db-conn-sql'
import type { ILogger } from '~/@/logger'
import { p } from '~/@/parser'
import { Pagination } from '~/@/query/query'
import { Ok, Result, isErr } from '~/@/result'
import { Sql } from '~/@/sql'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { Solutions } from '../../solutions/solutions'
import { Puzzle } from '../puzzle'
import type { IPuzzleDb } from './interface'
import { OrderClause, QueryPuzzlesInput, WhereClause } from './query'
import { Row } from './sql/row'

export const PuzzleDbSql = (config: { logger: ILogger; dbConnSql: IDbConnSql }): IPuzzleDb => {
  return {
    async get(flowPuzzleId) {
      const queried = await config.dbConnSql.query({
        parser: Row,
        rawSql: `
        SELECT
          id,
          flow_puzzle_name,
          flow,
          flow_solutions,
          created_at_posix,
          created_by_user_id,
          last_updated_at_posix,
          last_updated_by_user_id
        FROM
          game_flow_puzzle
        WHERE
            id = :id
        AND deleted_at IS NULL
        LIMIT 1
        `,
        variables: {
          id: flowPuzzleId,
        },
      })

      if (isErr(queried)) {
        return queried
      }

      const queriedPuzzle = queried.value.map(async (row): Promise<Puzzle[]> => {
        const flowPuzzle = Row.rowToPuzzle(row)
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

      const queried = await config.dbConnSql.query({
        parser: p.obj({
          count: p.str,
        }),
        rawSql: `
        SELECT
          COUNT(id) AS count
        FROM
          game_flow_puzzle
        ${where.str}
        `,
        variables: where.variables,
      })

      return Result.mapOk(queried, (x) => Number.parseFloat(x[0]?.count ?? '0'))
    },

    async query(input) {
      const sql = toQuerySql(input)
      const queried = await config.dbConnSql.query({
        parser: Row,
        rawSql: sql.str,
        variables: sql.variables,
      })

      if (isErr(queried)) {
        return queried
      }

      const queriedCount = await config.dbConnSql.query({
        parser: p.obj({
          count: p.str,
        }),
        rawSql: `
				SELECT
					COUNT(id) AS count
				FROM
          game_flow_puzzle
				${sql.where.str}
				`,
        variables: sql.variables,
      })

      if (isErr(queriedCount)) {
        return queriedCount
      }

      const queriedPuzzle = queried.value.map(async (row): Promise<Puzzle[]> => {
        const flowPuzzle = Row.rowToPuzzle(row)
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
      const queried = await config.dbConnSql.query({
        parser: p.unknown,
        rawSql: `
				INSERT INTO game_flow_puzzle (
					id,
					flow_puzzle_name,
					flow,
					created_at_posix,
					created_by_user_id,
					last_updated_at_posix,
					last_updated_by_user_id,
					flow_solutions
				)
				VALUES (
					:id,
					:flow_puzzle_name,
					:flow,
					:created_at_posix,
					:created_by_user_id,
					:last_updated_at_posix,
					:last_updated_by_user_id,
					:flow_solutions
				) ON CONFLICT (id) DO
				UPDATE SET
					flow_puzzle_name = :flow_puzzle_name,
					flow = :flow,
					last_updated_at_posix = :last_updated_at_posix,
					last_updated_by_user_id = :last_updated_by_user_id,
					flow_solutions = :flow_solutions
				`,
        variables: {
          id: flowPuzzle.id,
          flow_puzzle_name: flowPuzzle.name,
          flow: Sql.json(flowPuzzle.flow),
          flow_solutions: Sql.json(flowPuzzle.solutions),
          created_at_posix: flowPuzzle.createdAt,
          created_by_user_id: flowPuzzle.createdBy,
          last_updated_at_posix: flowPuzzle.lastUpdatedAt,
          last_updated_by_user_id: flowPuzzle.lastUpdatedBy,
        },
      })
      return Result.mapOk(queried, () => null)
    },

    async zap(input) {
      const queried = await config.dbConnSql.query({
        parser: p.num,
        rawSql: `
				UPDATE
					game_flow_puzzle
				SET
					deleted_at = :deleted_at,
					deleted_by_user_id = :deleted_by_user_id
				WHERE
					id = :id
				`,
        variables: {
          deleted_at: Posix.now(),
          deleted_by_user_id: input.deletedByUserId,
          id: input.id,
        },
      })
      return Result.mapOk(queried, () => null)
    },

    sub(input: QueryPuzzlesInput) {
      const sql = toQuerySql(input)
      return Sub.map(
        config.dbConnSql.sub({
          parser: Row,
          rawSql: sql.str,
          variables: sql.variables,
          primaryKey: ['id'],
          tableName: 'game_flow_puzzle',
        }),
        (rows) =>
          rows.flatMap((row) => {
            const puzzle = Row.rowToPuzzle(row)
            return puzzle ? [puzzle] : []
          }),
      )
    },
  }
}

const toQuerySql = (input: { where: WhereClause; order?: OrderClause; pagination?: Pagination }) => {
  const where = toSqlWhere(input)
  const order = input.order ? toSqlOrder({ order: input.order }) : { str: '' }
  const pagination = input.pagination ? toSqlPagination({ pagination: input.pagination }) : { str: '', variables: {} }

  const variables: Sql.Vars = {
    ...where.variables,
    ...pagination.variables,
  }
  const str = `
    SELECT
      id,
      flow_puzzle_name,
      flow,
      flow_solutions,
      created_at_posix,
      created_by_user_id,
      last_updated_at_posix,
      last_updated_by_user_id
    FROM
      game_flow_puzzle
    ${where.str}
    ${order.str}
    ${pagination.str}
  `

  return {
    str,
    variables,
    where,
    order,
    pagination,
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
      where.push(`id IN (${puzzleIds})`)
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
