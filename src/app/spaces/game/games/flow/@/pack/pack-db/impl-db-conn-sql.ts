import { ascend } from '~/@/array/sorting'
import type { IDbConnSql } from '~/@/db-conn-sql'
import { ILogger, Logger } from '~/@/logger'
import { p } from '~/@/schema'
import { isErr, isOk, Result, unwrapOr } from '~/@/result'
import { Sql } from '~/@/sql'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { Uuid } from '~/@/id/uuid'
import { UserId } from '~/app/@/data/user-id'
import { OrderClause, WhereClause } from '../../puzzle/puzzle-db/query'
import { PuzzleId } from '../../puzzle/puzzle-id'
import type { Pack } from '../pack'
import { PackId } from '../pack-id'
import { PackName } from '../pack-name'
import type { IPackDb } from './interface'

export type Config = {
  t: 'db-conn-sql'
  dbConnSql: IDbConnSql
  logger: ILogger
}

const Row = p.obj({
  id: PackId,
  name: PackName,
  created_at_posix: p.or(p.num, p.str),
  created_by_user_id: UserId,
  last_updated_at_posix: p.or(p.num, p.str),
  last_updated_by_user_id: UserId,
  deleted_at_posix: p.maybe(p.or(p.num, p.str)),
  deleted_by_user_id: p.maybe(UserId),
  is_official: p.maybe(p.bool),
})

type Row = p.Infer<typeof Row>

const RowItem = p.obj({
  id: p.str,
  pack_id: p.str,
  puzzle_id: p.str,
  position: p.or(p.num, p.str),
  created_at_posix: p.or(p.num, p.str),
  created_by_user_id: p.str,
  deleted_at_posix: p.maybe(p.or(p.num, p.str)),
  deleted_by_user_id: p.maybe(p.str),
})

type RowItem = p.Infer<typeof RowItem>

const rowToPack = (row: Row, items: RowItem[]): Pack | null => {
  return {
    isOfficial: row.is_official ?? false,
    createdAt: Posix.init(row.created_at_posix),
    createdBy: row.created_by_user_id,
    id: row.id,
    lastUpdatedAt: Posix.init(row.last_updated_at_posix),
    lastUpdatedBy: row.last_updated_by_user_id,
    name: row.name,
    puzzleIds: items
      .sort(
        ascend(
          (i) => ensureNumber(i.position),
          (i) => ensureNumber(i.created_at_posix),
          (i) => i.puzzle_id,
        ),
      )
      .flatMap((i) => {
        if (i.pack_id !== row.id) return []
        const puzzleId = PuzzleId.parse(i.puzzle_id)
        if (isErr(puzzleId)) return []
        return [puzzleId.value]
      }),
  }
}

const toSqlWhere = (where: WhereClause) => {
  const clauses: string[] = []

  clauses.push('game_flow_pack.deleted_at_posix IS NULL')

  const vars: Record<string, string | number | undefined | null> = {}

  if (where.createdBy?.equals) {
    clauses.push('game_flow_pack.created_by_user_id = :created_by_user_id')
    vars['created_by_user_id'] = where.createdBy?.equals
  }

  const str = clauses.length > 0 ? `WHERE ${clauses.join('\nAND\t')}` : ''

  return { str, vars }
}

const toSqlOrder = (order: OrderClause) => {
  const clauses: string[] = []
  const vars: Record<string, any> = {}
  if (order.createdAt) {
    clauses.push(`game_flow_pack.created_at_posix ${order.createdAt === 'asc' ? 'ASC' : 'DESC'}`)
  }
  if (order.lastUpdatedAt) {
    clauses.push(`game_flow_pack.last_updated_at_posix ${order.lastUpdatedAt === 'asc' ? 'ASC' : 'DESC'}`)
  }

  const str = clauses.length > 0 ? `ORDER BY ${clauses.join(',\n')}` : ''

  return { str, vars }
}

const ensureNumber = (maybeNumber: unknown): number => {
  if (typeof maybeNumber === 'number') {
    return maybeNumber
  }
  if (typeof maybeNumber === 'string') {
    return Number.parseFloat(maybeNumber)
  }
  return 0
}

const puzzleIdCsvToArray = (puzzleIdCsv: string): PuzzleId[] => {
  return puzzleIdCsv.split(',').flatMap((id) => {
    const puzzleId = PuzzleId.parse(id)
    return isOk(puzzleId) ? [puzzleId.value] : []
  })
}

export const PackDb = (config: Config): IPackDb => {
  const logger = Logger.prefix('pack db impl sql', config.logger)
  return {
    async get(id) {
      const queried = await config.dbConnSql.query({
        parser: Row,
        sql: 'SELECT * FROM game_flow_pack WHERE id = :id AND deleted_at_posix IS NULL',
        vars: {
          id: id,
        },
      })

      const queriedItems = await config.dbConnSql.query({
        parser: RowItem,
        sql: 'SELECT * FROM game_flow_pack_item WHERE pack_id = :pack_id AND deleted_at_posix IS NULL',
        vars: {
          pack_id: id,
        },
      })

      const items = unwrapOr(queriedItems, [])

      return Result.mapOk(queried, (row) => (row[0] ? rowToPack(row[0], items) : null))
    },

    async count(input) {
      const where = toSqlWhere(input.where)
      const vars = where.vars
      const sql = `SELECT COUNT(*) AS count FROM game_flow_pack ${where.str}`
      const queried = await config.dbConnSql.query({ parser: p.obj({ count: p.maybe(p.or(p.num, p.str)) }), sql, vars })
      return Result.mapOk(queried, (rows) => ensureNumber(rows[0]?.count))
    },

    sub(input) {
      const sqlWhere = toSqlWhere(input.where)
      const sqlOrder = toSqlOrder(input.order)
      const sqlPagination = Sql.pagination(input.pagination)
      const vars = {
        ...sqlWhere.vars,
        ...sqlOrder.vars,
        ...sqlPagination.vars,
      }

      const sql = `
        SELECT
          game_flow_pack.*,
          ${config.dbConnSql.aggregate.StringConcat('game_flow_pack_item.puzzle_id', ',')} AS puzzle_ids_csv
        FROM
          game_flow_pack
        LEFT JOIN
          game_flow_pack_item ON game_flow_pack_item.pack_id = game_flow_pack.id
        ${sqlWhere.str}
        GROUP BY
          game_flow_pack.id
        ${sqlOrder.str}
        ${sqlPagination.str};
			`
      const packsSub = config.dbConnSql.sub({
        parser: p.and(Row, p.obj({ puzzle_ids_csv: p.maybe(p.str) })),
        sql,
        vars,
      })

      return Sub.map(packsSub, (packRows) => {
        const packs = packRows.flatMap((row) => {
          const puzzleIds = puzzleIdCsvToArray(row.puzzle_ids_csv ?? '')
          const pack = rowToPack(row, [])
          return pack ? [{ ...pack, puzzleIds }] : []
        })
        return packs
      })
    },

    async list(input) {
      const sqlWhere = toSqlWhere(input.where)
      const sqlOrder = toSqlOrder(input.order)
      const sqlPagination = Sql.pagination(input.pagination)
      const vars = {
        ...sqlWhere.vars,
        ...sqlOrder.vars,
        ...sqlPagination.vars,
      }

      const str = `
				SELECT * FROM game_flow_pack
				${sqlWhere.str}
				${sqlOrder.str}
				${sqlPagination.str}
			`

      const queried = await config.dbConnSql.query({ parser: Row, sql: str, vars })

      const counted = await this.count(input)

      const total = Result.unwrapOr(counted, 0)

      const queriedItems = await config.dbConnSql.query({
        parser: RowItem,
        sql: `
        SELECT
          *
        FROM
          game_flow_pack_item
        JOIN
          game_flow_pack ON game_flow_pack_item.pack_id = game_flow_pack.id
        ${sqlWhere.str}
        ${sqlOrder.str}
        ${sqlPagination.str}
        `,
        vars,
      })

      const items = unwrapOr(queriedItems, [])

      const result = Result.mapOk(queried, (rows) => {
        return {
          ...input.pagination,
          items: rows.flatMap((row) => {
            const pack = rowToPack(row, items)
            return pack ? [pack] : []
          }),
          total,
        }
      })

      return result
    },

    async put(input) {
      const got = await this.get(input.id)
      if (isErr(got)) {
        return got
      }

      const deleted = await config.dbConnSql.query({
        parser: p.unknown,
        sql: 'DELETE FROM game_flow_pack_item WHERE pack_id = :pack_id',
        vars: {
          pack_id: input.id,
        },
      })
      if (isErr(deleted)) {
        logger.error(deleted.error)
      }
      const singleQuote = (str: string) => `'${str}'`

      if (input.puzzleIds.length > 0) {
        const sqlItemsEntries = input.puzzleIds.map((puzzleId, position) => {
          const entry: (string | number)[] = [
            singleQuote(Uuid.generate()),
            singleQuote(input.id),
            singleQuote(puzzleId),
            position,
            Posix.now(),
            singleQuote(input.createdBy),
          ]
          return `(${entry.join(',\n')})`
        })

        const sqlItems = `
        INSERT INTO game_flow_pack_item (
          id,
          pack_id,
          puzzle_id,
          "position",
          created_at_posix,
          created_by_user_id
        ) VALUES 
          ${sqlItemsEntries.join(',\n')}
      `

        const insertedItems = await config.dbConnSql.query({
          parser: p.unknown,
          sql: sqlItems,
          vars: {},
        })

        if (isErr(insertedItems)) {
          logger.error(insertedItems.error)
        }
      }

      if (got.value) {
        const queried = await config.dbConnSql.query({
          parser: p.unknown,
          sql: `
          UPDATE
            game_flow_pack
          SET
            name = :name,
            last_updated_at_posix = :last_updated_at_posix,
            last_updated_by_user_id = :last_updated_by_user_id
          WHERE
            id = :id
          `,
          vars: {
            id: input.id,
            name: input.name,
            last_updated_at_posix: input.lastUpdatedAt,
            last_updated_by_user_id: input.lastUpdatedBy,
          },
        })
        return Result.mapOk(queried, () => input)
      }

      const queried = await config.dbConnSql.query({
        parser: p.unknown,
        sql: `
				INSERT INTO game_flow_pack (
					id,
					name,
					created_at_posix,
					created_by_user_id,
					last_updated_at_posix,
					last_updated_by_user_id,
					deleted_at_posix,
					deleted_by_user_id
				) VALUES (
					:id,
					:name,
					:created_at_posix,
					:created_by_user_id,
					:last_updated_at_posix,
					:last_updated_by_user_id,
					:deleted_at_posix,
					:deleted_by_user_id
				)`,
        vars: {
          id: input.id,
          name: input.name,
          created_at_posix: input.createdAt,
          created_by_user_id: input.createdBy,
          last_updated_at_posix: input.lastUpdatedAt,
          last_updated_by_user_id: input.lastUpdatedBy,
          deleted_at_posix: null,
          deleted_by_user_id: null,
        },
      })

      return Result.mapOk(queried, () => input)
    },

    async zap(input) {
      const queried = await config.dbConnSql.query({
        parser: p.unknown,
        sql: `
          UPDATE game_flow_pack 
          SET 
            deleted_at_posix = :deleted_at_posix,
            deleted_by_user_id = :deleted_by_user_id
          WHERE id = :id
        `,
        vars: {
          id: input.id,
          deleted_at_posix: Posix.now(),
          deleted_by_user_id: input.deletedBy,
        },
      })
      return Result.mapOk(queried, () => null)
    },
  }
}
