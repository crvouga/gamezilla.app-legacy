import { EventSourced } from '~/@/event-sourced'
import { Json } from '~/@/json/json'
import { ILogger } from '~/@/logger'
import { Err, isErr, Ok, Result, unwrap } from '~/@/result'
import { s } from '~/@/schema'
import { Sql } from '~/@/sql'
import { ISqlDb } from '~/@/sql-db'
import { Sub } from '~/@/sub'
import { UnixMs } from '~/@/time/unix-ms'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '..'
import { SpaceProjection } from '../../space-projection'
import type { ISpaceDb, SpaceDbConfig } from './interface'
import { SpaceQuery } from './query'

export type Config = SpaceDbConfig & {
  t: 'sql-db'
  sqlDb: ISqlDb
  logger: ILogger
  shouldCreateTable: boolean
}

export const Row = s.obj({
  id: SpaceId,
  created_at_unix_ms: s.or(UnixMs, s.str()),
  updated_at_unix_ms: s.or(UnixMs, s.str()),
  deleted_at_unix_ms: s.maybe(s.or(UnixMs, s.str())),
  model: s.or(s.str(), s.json),
})

export type Row = s.Infer<typeof Row>

const parseRow = (row: Row, logger: ILogger): Result<string, Space.Model> => {
  if (typeof row.model === 'string') {
    const json = Json.parse(row.model)

    if (isErr(json)) return Err('Failed to parse model as json')

    const space = Space.Model.parse(json.value)

    if (isErr(space)) {
      logger.error('Errored parsing model as space', space.error)
      return Err('Failed to parse model as space')
    }

    return Ok(space.value)
  }

  const space = Space.Model.parse(row.model)

  if (isErr(space)) {
    logger.error('Errored parsing model as space', space.error)
    return Err('Failed to parse model as space')
  }

  return Ok(space.value)
}

const parseRows = (rows: Row[], logger: ILogger): Space.Model[] => {
  const parsed = rows.flatMap((row) => {
    const parsed = parseRow(row, logger)
    if (isErr(parsed)) return []
    return [parsed.value]
  })
  return parsed
}

const QUERY_CREATE_TABLES = [
  `
CREATE TABLE IF NOT EXISTS space (
  id TEXT PRIMARY KEY,
  created_at_unix_ms INT NOT NULL,
  updated_at_unix_ms INT NOT NULL,
  deleted_at_unix_ms INT,
  model TEXT NOT NULL
)
  `,
  `
CREATE TABLE IF NOT EXISTS space_projection (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  game_id TEXT NOT NULL
)
  `,
]

export const SpaceDb = async (config: Config): Promise<ISpaceDb> => {
  if (config.shouldCreateTable) {
    config.logger.info('Creating space table')
    for (const query of QUERY_CREATE_TABLES) {
      unwrap(await config.sqlDb.query({ schema: s.unknown, sql: query, vars: {} }))
    }
    config.logger.info('Space table created')
  }

  config.input?.sub(async (msg) => {
    switch (msg.t) {
      case 'dangerously-override-model': {
        const { model } = msg
        const spaceId = Space.toSpaceId(model)
        if (!spaceId) throw new Error('Failed to derive spaceId from space')
        const stringified = Json.stringify(model)
        if (isErr(stringified)) throw stringified.error
        await upsertSpace(config, spaceId, model)
        config.output?.pub({ t: 'model-dangerously-overridden', model })
        return
      }
    }
  })

  return {
    async query(input) {
      const { sql, vars } = toSqlQuery(input)

      const result = await config.sqlDb.query({ schema: Row, sql, vars })

      if (isErr(result)) return result

      const parsed = parseRows(result.value, config.logger)

      return Ok({
        items: parsed,
        total: parsed.length,
        limit: input.limit ?? Infinity,
        offset: input.offset ?? 0,
      })
    },
    sub(input, map) {
      const { sql, vars } = toSqlQuery(input)
      return Sub.map(config.sqlDb.sub({ schema: Row, sql, vars }), (rows) => {
        const mapped = map(parseRows(rows, config.logger))
        return mapped
      })
    },
    async upsert(space) {
      const stringified = Json.stringify(space)
      if (isErr(stringified)) return stringified

      const spaceId = Space.toSpaceId(space)
      if (!spaceId) return Err('Failed to derive spaceId from space')

      const latestSnapshot = EventSourced.toLatestSnapshot(space)

      const upsertedSnapshot = await upsertSnapshot(config, spaceId, latestSnapshot)

      if (isErr(upsertedSnapshot)) return upsertedSnapshot

      const upserted = await upsertSpace(config, spaceId, space)

      if (isErr(upserted)) return upserted

      return Ok(null)
    },
  }
}

const upsertSpace = async (config: Config, spaceId: SpaceId, space: Space.Model): Promise<Result<string, null>> => {
  const found = await config.sqlDb.query({
    schema: s.unknown,
    sql: `SELECT * FROM space WHERE id = :id`,
    vars: {
      id: spaceId,
    },
  })

  if (isErr(found)) return found

  const stringified = Json.stringify(space)
  if (isErr(stringified)) return stringified

  if (found.value.length === 0) {
    const inserted = await config.sqlDb.query({
      schema: s.unknown,
      sql: `INSERT INTO space (id, created_at_unix_ms, updated_at_unix_ms, model) VALUES (:id, :created_at_unix_ms, :updated_at_unix_ms, :model)`,
      vars: {
        id: spaceId,
        created_at_unix_ms: UnixMs.now(),
        updated_at_unix_ms: UnixMs.now(),
        model: stringified.value,
      },
    })

    if (isErr(inserted)) return inserted

    return Ok(null)
  }

  const updated = await config.sqlDb.query({
    schema: s.unknown,
    sql: `UPDATE space SET model = :model WHERE id = :id`,
    vars: {
      id: spaceId,
      model: stringified.value,
    },
  })

  if (isErr(updated)) return updated

  return Ok(null)
}

const upsertSnapshot = async (
  config: Config,
  spaceId: SpaceId,
  snapshot: SpaceProjection.Model,
): Promise<Result<string, null>> => {
  const found = await config.sqlDb.query({
    schema: s.unknown,
    sql: `SELECT * FROM space_projection WHERE id = :id`,
    vars: {
      id: spaceId,
    },
  })

  if (isErr(found)) return found

  if (found.value.length === 0) {
    const inserted = await config.sqlDb.query({
      schema: s.unknown,
      sql: `INSERT INTO space_projection (id, host_id, game_id) VALUES (:id, :host_id, :game_id)`,
      vars: {
        id: spaceId,
        host_id: snapshot.type === 'initial' ? null : snapshot.hostId,
        game_id: snapshot.type === 'initial' ? null : (snapshot.game?.t ?? null),
      },
    })

    if (isErr(inserted)) return inserted

    return Ok(null)
  }

  const updated = await config.sqlDb.query({
    schema: s.unknown,
    sql: `UPDATE space_projection SET host_id = :host_id, game_id = :game_id WHERE id = :id`,
    vars: {
      id: spaceId,
      host_id: snapshot.type === 'initial' ? null : snapshot.hostId,
      game_id: snapshot.type === 'initial' ? null : (snapshot.game?.t ?? null),
    },
  })

  if (isErr(updated)) return updated

  return Ok(null)
}

const toSqlQuery = (input: SpaceQuery) => {
  const sqlWhere = toSqlWhere(input)
  const sqlPagination = toSqlPagination(input)

  const vars: Sql.Vars = {
    ...sqlWhere.vars,
    ...sqlPagination.vars,
  }

  const sql = `
  WITH space_ids AS (
    SELECT id FROM space_projection
    ${sqlWhere.str}
    ${sqlPagination.str}
  )
  SELECT id, created_at_unix_ms, updated_at_unix_ms, deleted_at_unix_ms, model FROM space
  WHERE id IN (SELECT id FROM space_ids)
  `

  return {
    sql,
    vars,
  }
}

const toSqlWhere = (input: SpaceQuery) => {
  const vars: Sql.Vars = {}
  const clauses: string[] = []

  if (input.where?.spaceId?.['=']) {
    clauses.push(`id = :space_id`)
    vars['space_id'] = input.where.spaceId['=']
  }

  if (input.where?.hostId?.['=']) {
    clauses.push(`host_id = :host_id`)
    vars['host_id'] = input.where.hostId['=']
  }

  const str = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''

  return {
    str,
    vars,
  }
}

const toSqlPagination = (input: SpaceQuery) => {
  const vars: Sql.Vars = {}
  const clauses: string[] = []

  if (input.limit) {
    clauses.push(`LIMIT :limit`)
    vars['limit'] = input.limit
  }

  if (input.offset) {
    clauses.push(`OFFSET :offset`)
    vars['offset'] = input.offset
  }

  const str = clauses.length > 0 ? `LIMIT :limit OFFSET :offset` : ''

  return {
    str,
    vars,
  }
}
