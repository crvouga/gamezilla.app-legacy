import { Ok, Result, isErr } from '~/@/result'
import { p } from '~/@/parser'
import type { IDbConnSql } from '~/@/db-conn-sql'
import type { ILogger } from '~/@/logger'
import { Sql } from '~/@/sql'
import { Posix } from '~/@/time/posix'
import { UserId, type Pagination } from '~/app/@/data'
import { Flow } from '../../flow/flow'
import { FlowVariant } from '../../flow/flow-variant'
import type { Puzzle } from '../puzzle'
import { PuzzleId } from '../puzzle-id'
import { PuzzleName } from '../puzzle-name'
import type { IPuzzleDb, OrderClause, WhereClause } from './interface'

export const Row = p.obj({
  flow_puzzle_id: p.str,
  flow_puzzle_name: p.str,
  flow: p.json,
  flow_solutions: p.json,
  created_at_posix: p.or(p.num, p.str),
  created_by_user_id: p.str,
  last_updated_at_posix: p.or(p.num, p.str),
  last_updated_by_user_id: p.str
})

export type Row = p.Infer<typeof Row>

const ensureNumber = (x: string | number): number => {
  return typeof x === 'string' ? Number.parseFloat(x) : x
}

const rowToPuzzle = (row: Row): Puzzle | null => {
  const flowPuzzleId = PuzzleId.is(row.flow_puzzle_id) ? row.flow_puzzle_id : null
  const puzzleName = PuzzleName.is(row.flow_puzzle_name) ? row.flow_puzzle_name : null

  const parsedFlow = FlowVariant.Model.parse(row.flow)
  const flow = Result.unwrapOr(parsedFlow, null)

  const createdAt = Posix.init(ensureNumber(row.created_at_posix))
  const createdBy = UserId.is(row.created_by_user_id) ? row.created_by_user_id : null
  const lastUpdatedAt = Posix.init(ensureNumber(row.last_updated_at_posix))
  const lastUpdatedBy = UserId.is(row.last_updated_by_user_id) ? row.last_updated_by_user_id : null

  const parsedFlowSolutions = p.arr(p.or(FlowVariant.Model, Flow.Model)).parse(row.flow_solutions)
  const flowSolutions = Result.unwrapOr(parsedFlowSolutions, [])

  if (flowPuzzleId && puzzleName && flow && createdAt && createdBy && lastUpdatedAt && lastUpdatedBy) {
    return {
      id: flowPuzzleId,
      name: puzzleName,
      flow: flow,
      createdAt,
      createdBy,
      lastUpdatedAt,
      lastUpdatedBy,
      solutions: flowSolutions
    }
  }
  console.error(
    `[flow-puzzle-db] Failed to parse row=${JSON.stringify(row, null, 4)} \nerror=${JSON.stringify(
      parsedFlow,
      null,
      4
    )}`
  )
  return null
}

//
//
//
//
//

const toSqlWhere = (input: { where: WhereClause }) => {
  const variables: Sql.Vars = {}
  const where: string[] = [
    //
    'deleted_at IS NULL'
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
    variables
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
    str
  }
}

const toSqlPagination = (input: { pagination: Pagination }) => {
  const variables: Sql.Vars = {
    limit: input.pagination.limit,
    offset: input.pagination.offset
  }
  const str = 'LIMIT :limit OFFSET :offset'
  return {
    variables,
    str
  }
}

export const PuzzleDbPostgres = ({ dbConnSql }: { logger: ILogger; dbConnSql: IDbConnSql }): IPuzzleDb => {
  return {
    async get(flowPuzzleId) {
      const queried = await dbConnSql.query(
        Row,
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
          flow_puzzle_id: flowPuzzleId
        }
      )

      if (isErr(queried)) {
        return queried
      }

      const queriedPuzzle = queried.value.map(async (row): Promise<Puzzle[]> => {
        const flowPuzzle = rowToPuzzle(row)
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

      const queried = await dbConnSql.query(
        p.obj({
          count: p.str
        }),
        `
				SELECT
					COUNT(*) AS count
				FROM
					game_flow_puzzle
					${where.str}
				`,
        where.variables
      )
      return Result.mapOk(queried, (x) => Number.parseFloat(x[0]?.count ?? '0'))
    },

    async list(input) {
      const where = toSqlWhere(input)
      const order = toSqlOrder(input)
      const pagination = toSqlPagination(input)

      const variables: Sql.Vars = {
        ...where.variables,
        ...pagination.variables
      }

      const queried = await dbConnSql.query(
        Row,
        `
				SELECT
					*
				FROM
					game_flow_puzzle
				${where.str}
				${order.str}
				${pagination.str}
				`,
        variables
      )

      if (isErr(queried)) {
        return queried
      }

      const queriedCount = await dbConnSql.query(
        p.obj({
          count: p.str
        }),
        `
				SELECT
					COUNT(*) AS count
				FROM
					game_flow_puzzle
				${where.str}
				`,
        variables
      )

      if (isErr(queriedCount)) {
        return queriedCount
      }

      const queriedPuzzle = queried.value.map(async (row): Promise<Puzzle[]> => {
        const flowPuzzle = rowToPuzzle(row)
        if (!flowPuzzle) {
          return []
        }
        return [flowPuzzle]
      })

      const awaited = await Promise.all(queriedPuzzle)

      const flowPuzzles = awaited.flat()

      const total = Number.parseFloat(queriedCount.value[0]?.count ?? '0') ?? 0

      return Ok({
        items: flowPuzzles,
        total: total,
        limit: input.pagination.limit,
        offset: input.pagination.offset
      })
    },

    async put(flowPuzzle) {
      const queried = await dbConnSql.query(
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
          last_updated_by_user_id: flowPuzzle.lastUpdatedBy
        }
      )
      return Result.mapOk(queried, () => null)
    },

    async zap(input) {
      const queried = await dbConnSql.query(
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
          flow_puzzle_id: input.id
        }
      )
      return Result.mapOk(queried, () => null)
    }
  }
}
