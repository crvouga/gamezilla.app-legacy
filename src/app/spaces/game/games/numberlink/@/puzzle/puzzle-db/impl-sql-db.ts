import type { ILogger } from '~/@/logger'
import { Pagination } from '~/@/query/query'
import { Ok, Result, isErr } from '~/@/result'
import { s } from '~/@/schema'
import { Sql } from '~/@/sql'
import type { ISqlDb } from '~/@/sql-db'
import { UnixMs } from '~/@/time/unix-ms'
import { Puzzle } from '../puzzle'
import type { IPuzzleDb } from './interface'
import { OrderClause, PuzzleQuery, WhereClause } from './interface-query'
import { Row } from './sql/row'

export type Config = {
  t: 'sql-db'
  logger: ILogger
  sqlDb: ISqlDb
}

const CREATE_TABLES: string[] = [
  `
  CREATE TABLE IF NOT EXISTS game_numberlink_puzzle (
      id TEXT NOT NULL,
      name TEXT NOT NULL,
      model TEXT NOT NULL,
      created_at_unix_ms INTEGER NOT NULL,
      created_by_user_id TEXT NOT NULL,
      last_updated_at_unix_ms INTEGER NOT NULL,
      last_updated_by_user_id TEXT NOT NULL,
      deleted_at_unix_ms INTEGER,
      deleted_by_user_id TEXT,
      solutions TEXT NOT NULL
  );
  `,
]

export const PuzzleDb = (config: Config): IPuzzleDb => {
  for (const query of CREATE_TABLES) {
    config.sqlDb.query({ schema: s.unknown, sql: query, vars: {} })
  }

  return {
    async get(puzzleId) {
      const queried = await config.sqlDb.query({
        schema: Row,
        sql: `
        SELECT
          id,
          name,
          model,
          solutions,
          created_at_unix_ms,
          created_by_user_id,
          last_updated_at_unix_ms,
          last_updated_by_user_id
        FROM
          game_numberlink_puzzle
        WHERE
          id = :id
          AND deleted_at_unix_ms IS NULL
        LIMIT 1
        `,
        vars: {
          id: puzzleId,
        },
      })

      if (isErr(queried)) {
        return queried
      }

      const queriedPuzzle = queried.value.map(async (row): Promise<Puzzle[]> => {
        const puzzle = Row.rowToPuzzle(row)
        if (!puzzle) {
          return []
        }
        return [puzzle]
      })

      const awaited = await Promise.all(queriedPuzzle)
      const puzzles = awaited.flat()

      return Ok(puzzles[0] ?? null)
    },

    async put(puzzle) {
      const got = await this.get(puzzle.id)
      if (isErr(got)) {
        return got
      }
      if (got.value) {
        // First try to update existing record
        const updateResult = await config.sqlDb.query({
          schema: s.num(),
          sql: `
          UPDATE game_numberlink_puzzle
          SET
            name = :name,
            model = :model,
            last_updated_at_unix_ms = :lastUpdatedAt,
            last_updated_by_user_id = :lastUpdatedBy,
            solutions = :solutions
          WHERE
            id = :id
          `,
          vars: {
            id: puzzle.id,
            name: puzzle.name,
            model: Sql.json(puzzle.model),
            lastUpdatedAt: puzzle.lastUpdatedAt,
            lastUpdatedBy: puzzle.lastUpdatedBy,
            solutions: Sql.json(puzzle.solutions),
          },
        })

        if (isErr(updateResult)) {
          return updateResult
        }

        return Ok(null)
      }

      const insertResult = await config.sqlDb.query({
        schema: s.unknown,
        sql: `
          INSERT INTO game_numberlink_puzzle (
            id,
            name,
            model,
            created_at_unix_ms,
            created_by_user_id,
            last_updated_at_unix_ms,
            last_updated_by_user_id,
            solutions
          )
          VALUES (
            :id,
            :name,
            :model,
            :createdAt,
            :createdBy,
            :lastUpdatedAt,
            :lastUpdatedBy,
            :solutions
          )
          `,
        vars: {
          id: puzzle.id,
          name: puzzle.name,
          model: Sql.json(puzzle.model),
          createdAt: puzzle.createdAt,
          createdBy: puzzle.createdBy,
          lastUpdatedAt: puzzle.lastUpdatedAt,
          lastUpdatedBy: puzzle.lastUpdatedBy,
          solutions: Sql.json(puzzle.solutions),
        },
      })

      if (isErr(insertResult)) {
        return insertResult
      }

      return Ok(null)
    },

    async zap(input) {
      const queried = await config.sqlDb.query({
        schema: s.num(),
        sql: `
        UPDATE
          game_numberlink_puzzle
        SET
          deleted_at_unix_ms = :deletedAt,
          deleted_by_user_id = :deletedBy
        WHERE
          id = :id
        `,
        vars: {
          deletedAt: UnixMs.now(),
          deletedBy: input.deletedByUserId,
          id: input.puzzleId,
        },
      })
      return Result.mapOk(queried, () => null)
    },

    async count(input) {
      const where = toSqlWhere(input)

      const queried = await config.sqlDb.query({
        schema: s.obj({
          count: s.maybe(s.or(s.str(), s.num())),
        }),
        sql: `
        SELECT
          COUNT(id) AS count
        FROM
          game_numberlink_puzzle
        ${where.str}
        `,
        vars: where.variables,
      })

      return Result.mapOk(queried, (x) => Number.parseFloat(String(x[0]?.count ?? '0')))
    },

    async query(input) {
      const sql = toQuerySql(input)
      const queried = await config.sqlDb.query({
        schema: Row,
        sql: sql.str,
        vars: sql.variables,
      })

      if (isErr(queried)) {
        return queried
      }

      const queriedCount = await config.sqlDb.query({
        schema: s.obj({
          count: s.maybe(s.or(s.str(), s.num())),
        }),
        sql: `
        SELECT
          COUNT(id) AS count
        FROM
          game_numberlink_puzzle
        ${sql.where.str}
        `,
        vars: sql.variables,
      })

      if (isErr(queriedCount)) {
        return queriedCount
      }

      const queriedPuzzle = queried.value.map(async (row): Promise<Puzzle[]> => {
        const puzzle = Row.rowToPuzzle(row)
        if (!puzzle) {
          return []
        }
        return [puzzle]
      })

      const awaited = await Promise.all(queriedPuzzle)
      const puzzles = awaited.flat()
      const total = Number.parseFloat(String(queriedCount.value[0]?.count ?? '0')) ?? 0

      return Ok({
        puzzles: {
          items: puzzles,
          total: total,
          limit: input.pagination.limit,
          offset: input.pagination.offset,
        },
      })
    },

    sub(input: PuzzleQuery) {
      const sql = toQuerySql(input)
      return config.sqlDb.sub({ schema: Row, sql: sql.str, vars: sql.variables }, (rows) => {
        return rows.flatMap((row) => {
          const puzzle = Row.rowToPuzzle(row)
          return puzzle ? [puzzle] : []
        })
      })
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
      name,
      model,
      solutions,
      created_at_unix_ms,
      created_by_user_id,
      last_updated_at_unix_ms,
      last_updated_by_user_id
    FROM
      game_numberlink_puzzle
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
  const where: string[] = ['deleted_at_unix_ms IS NULL']

  if (input.where.createdBy?.equals) {
    where.push('created_by_user_id = :createdBy')
    variables.createdBy = input.where.createdBy.equals
  }

  if (input.where.puzzleId?.in) {
    if (input.where.puzzleId.in.length > 0) {
      const placeholders = input.where.puzzleId.in.map((_, idx) => `:puzzleId${idx}`).join(', ')
      where.push(`id IN (${placeholders})`)
      input.where.puzzleId.in.forEach((id, idx) => {
        variables[`puzzleId${idx}`] = id
      })
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
    orderBy.push(`created_at_unix_ms ${input.order.createdAt === 'desc' ? 'DESC' : 'ASC'}`)
  }

  if (input.order.lastUpdatedAt) {
    orderBy.push(`last_updated_at_unix_ms ${input.order.lastUpdatedAt === 'desc' ? 'DESC' : 'ASC'}`)
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
