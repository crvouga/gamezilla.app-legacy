import { ascend } from '~/@/array/sorting'
import { pipe } from '~/@/function/pipe'
import { Uuid } from '~/@/id/uuid'
import { ILogger } from '~/@/logger'
import { isErr, isOk, Result, unwrapOr } from '~/@/result'
import { s } from '~/@/schema'
import { ParseError } from '~/@/schema/schema/parse-error'
import { Sql } from '~/@/sql'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import type { ISqlDb } from '~/@/sql-db/interface'
import { UnixMs } from '~/@/time/unix-ms'
import { UserId } from '~/app/@/data/user-id'
import { OrderClause, WhereClause } from '../../puzzle/puzzle-db/interface-query'
import { PuzzleId } from '../../puzzle/puzzle-id'
import { Pack } from '../pack'
import { PackId } from '../pack-id'
import { PackName } from '../pack-name'
import type { IPackDb } from './interface'

export type ImplSqlDb = {
  t: 'sql-db'
  sqlDb: ISqlDb
  logger: ILogger
  migrationPolicy: ISqlDbMigrationPolicy
}

const Row = s.obj({
  id: PackId,
  name: PackName,
  created_at_unix_ms: s.or(s.num(), s.str()),
  created_by_user_id: UserId,
  last_updated_at_unix_ms: s.or(s.num(), s.str()),
  last_updated_by_user_id: UserId,
  deleted_at_unix_ms: s.maybe(s.or(s.num(), s.str())),
  deleted_by_user_id: s.maybe(UserId),
  is_official: s.maybe(s.bool),
  puzzle_ids_csv: s.maybe(s.str()),
})

type Row = s.Infer<typeof Row>

const RowItem = s.obj({
  id: s.str(),
  pack_id: s.str(),
  puzzle_id: s.str(),
  position: s.or(s.num(), s.str()),
  created_at_unix_ms: s.or(s.num(), s.str()),
  created_by_user_id: s.str(),
  deleted_at_unix_ms: s.maybe(s.or(s.num(), s.str())),
  deleted_by_user_id: s.maybe(s.str()),
})

type RowItem = s.Infer<typeof RowItem>

const UP: string[] = [
  `
  CREATE TABLE IF NOT EXISTS game_numberlink_pack (
      id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at_unix_ms BIGINT NOT NULL,
      created_by_user_id TEXT NOT NULL,
      last_updated_at_unix_ms BIGINT NOT NULL,
      last_updated_by_user_id TEXT NOT NULL,
      deleted_at_unix_ms BIGINT,
      deleted_by_user_id TEXT
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS game_numberlink_pack_item (
      id TEXT NOT NULL,
      pack_id TEXT NOT NULL,
      puzzle_id TEXT NOT NULL,
      "position" BIGINT NOT NULL,
      created_at_unix_ms BIGINT NOT NULL,
      created_by_user_id TEXT NOT NULL,
      deleted_at_unix_ms BIGINT,
      deleted_by_user_id TEXT
  );
  `,
]
const DOWN: string[] = [`DROP TABLE IF EXISTS game_numberlink_pack_item`, `DROP TABLE IF EXISTS game_numberlink_pack`]

const rowToPack = (row: Row, items: RowItem[]): Pack => {
  return {
    isOfficial: row.is_official ?? false,
    createdAt: UnixMs.init(row.created_at_unix_ms),
    createdBy: row.created_by_user_id,
    id: row.id,
    lastUpdatedAt: UnixMs.init(row.last_updated_at_unix_ms),
    lastUpdatedBy: row.last_updated_by_user_id,
    name: row.name,
    puzzleIds: items
      .sort(
        ascend(
          (i) => ensureNumber(i.position),
          (i) => ensureNumber(i.created_at_unix_ms),
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

Pack.fromUnknownRegister((data) => {
  return pipe(
    data,
    Row.parse,
    (x) => Result.mapErr(x, ParseError.toString),
    (x) => Result.mapOk(x, (row) => rowToPack(row, [])),
  )
})

const toSqlWhere = (where: WhereClause) => {
  const clauses: string[] = []

  clauses.push('game_numberlink_pack.deleted_at_unix_ms IS NULL')

  const vars: Record<string, string | number | undefined | null> = {}

  if (where.createdBy?.equals) {
    clauses.push('game_numberlink_pack.created_by_user_id = :created_by_user_id')
    vars['created_by_user_id'] = where.createdBy?.equals
  }

  const str = clauses.length > 0 ? `WHERE ${clauses.join('\nAND\t')}` : ''

  return { str, vars }
}

const toSqlOrder = (order: OrderClause) => {
  const clauses: string[] = []
  const vars: Record<string, any> = {}
  if (order.createdAt) {
    clauses.push(`game_numberlink_pack.created_at_unix_ms ${order.createdAt === 'asc' ? 'ASC' : 'DESC'}`)
  }
  if (order.lastUpdatedAt) {
    clauses.push(`game_numberlink_pack.last_updated_at_unix_ms ${order.lastUpdatedAt === 'asc' ? 'ASC' : 'DESC'}`)
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

const init = (config: ImplSqlDb): IPackDb => {
  const logger = config.logger.child(['pack db impl sql'])

  config.migrationPolicy.execute({
    logger,
    up: UP,
    down: DOWN,
    sqlDb: config.sqlDb,
  })
  return {
    async get(id) {
      const queried = await config.sqlDb.query({
        schema: Row,
        sql: 'SELECT * FROM game_numberlink_pack WHERE id = :id AND deleted_at_unix_ms IS NULL',
        vars: {
          id: id,
        },
      })

      const queriedItems = await config.sqlDb.query({
        schema: RowItem,
        sql: 'SELECT * FROM game_numberlink_pack_item WHERE pack_id = :pack_id AND deleted_at_unix_ms IS NULL',
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
      const sql = `SELECT COUNT(*) AS count FROM game_numberlink_pack ${where.str}`
      const queried = await config.sqlDb.query({
        schema: s.obj({ count: s.maybe(s.or(s.num(), s.str())) }),
        sql,
        vars,
      })
      return Result.mapOk(queried, (rows) => ensureNumber(rows[0]?.count))
    },

    sub(input, mapper) {
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
          game_numberlink_pack.*,
          ${config.sqlDb.aggregate.StringConcat('game_numberlink_pack_item.puzzle_id', ',')} AS puzzle_ids_csv
        FROM
          game_numberlink_pack
        LEFT JOIN
          game_numberlink_pack_item ON game_numberlink_pack_item.pack_id = game_numberlink_pack.id
        ${sqlWhere.str}
        GROUP BY
          game_numberlink_pack.id,
          game_numberlink_pack.name,
          game_numberlink_pack.created_at_unix_ms,
          game_numberlink_pack.created_by_user_id,
          game_numberlink_pack.last_updated_at_unix_ms,
          game_numberlink_pack.last_updated_by_user_id,
          game_numberlink_pack.deleted_at_unix_ms,
          game_numberlink_pack.deleted_by_user_id
        ${sqlOrder.str}
        ${sqlPagination.str};
			`

      return config.sqlDb.sub({ schema: Row, sql, vars }, (rows) => {
        const packs: Pack[] = rows.flatMap((row) => {
          const puzzleIds = puzzleIdCsvToArray(row.puzzle_ids_csv ?? '')
          const pack = rowToPack(row, [])
          return pack ? [{ ...pack, puzzleIds }] : []
        })
        return mapper(packs)
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
				SELECT * FROM game_numberlink_pack
				${sqlWhere.str}
				${sqlOrder.str}
				${sqlPagination.str}
			`

      const queried = await config.sqlDb.query({ schema: Row, sql: str, vars })

      const counted = await this.count(input)

      const total = Result.unwrapOr(counted, 0)

      const queriedItems = await config.sqlDb.query({
        schema: RowItem,
        sql: `
        SELECT
          *
        FROM
          game_numberlink_pack_item
        JOIN
          game_numberlink_pack ON game_numberlink_pack_item.pack_id = game_numberlink_pack.id
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

      const deleted = await config.sqlDb.query({
        schema: s.unknown,
        sql: 'DELETE FROM game_numberlink_pack_item WHERE pack_id = :pack_id',
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
            UnixMs.now(),
            singleQuote(input.createdBy),
          ]
          return `(${entry.join(',\n')})`
        })

        const sqlItems = `
        INSERT INTO game_numberlink_pack_item (
          id,
          pack_id,
          puzzle_id,
          "position",
          created_at_unix_ms,
          created_by_user_id
        ) VALUES 
          ${sqlItemsEntries.join(',\n')}
      `

        const insertedItems = await config.sqlDb.query({
          schema: s.unknown,
          sql: sqlItems,
          vars: {},
        })

        if (isErr(insertedItems)) {
          logger.error(insertedItems.error)
        }
      }

      if (got.value) {
        const queried = await config.sqlDb.query({
          schema: s.unknown,
          sql: `
          UPDATE
            game_numberlink_pack
          SET
            name = :name,
            last_updated_at_unix_ms = :last_updated_at_unix_ms,
            last_updated_by_user_id = :last_updated_by_user_id
          WHERE
            id = :id
          `,
          vars: {
            id: input.id,
            name: input.name,
            last_updated_at_unix_ms: input.lastUpdatedAt,
            last_updated_by_user_id: input.lastUpdatedBy,
          },
        })
        return Result.mapOk(queried, () => input)
      }

      const queried = await config.sqlDb.query({
        schema: s.unknown,
        sql: `
				INSERT INTO game_numberlink_pack (
					id,
					name,
					created_at_unix_ms,
					created_by_user_id,
					last_updated_at_unix_ms,
					last_updated_by_user_id,
					deleted_at_unix_ms,
					deleted_by_user_id
				) VALUES (
					:id,
					:name,
					:created_at_unix_ms,
					:created_by_user_id,
					:last_updated_at_unix_ms,
					:last_updated_by_user_id,
					:deleted_at_unix_ms,
					:deleted_by_user_id
				)`,
        vars: {
          id: input.id,
          name: input.name,
          created_at_unix_ms: input.createdAt,
          created_by_user_id: input.createdBy,
          last_updated_at_unix_ms: input.lastUpdatedAt,
          last_updated_by_user_id: input.lastUpdatedBy,
          deleted_at_unix_ms: null,
          deleted_by_user_id: null,
        },
      })

      return Result.mapOk(queried, () => input)
    },

    async zap(input) {
      const queried = await config.sqlDb.query({
        schema: s.unknown,
        sql: `
          UPDATE game_numberlink_pack 
          SET 
            deleted_at_unix_ms = :deleted_at_unix_ms,
            deleted_by_user_id = :deleted_by_user_id
          WHERE id = :id
        `,
        vars: {
          id: input.id,
          deleted_at_unix_ms: UnixMs.now(),
          deleted_by_user_id: input.deletedBy,
        },
      })
      return Result.mapOk(queried, () => null)
    },
  }
}

export const ImplSqlDb = {
  init,
}
