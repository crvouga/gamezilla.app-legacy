import { Json } from '~/@/json/json'
import { Err, isErr, Ok, Result, unwrap } from '~/@/result'
import { s } from '~/@/schema'
import { Sql } from '~/@/sql'
import { ISqlDb } from '~/@/sql-db'
import { UnixMs } from '~/@/time/posix'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '..'
import type { ISpaceDb, SpaceDbConfig } from './interface'

export type Config = SpaceDbConfig & {
  t: 'sql-db'
  sqlDb: ISqlDb
}

export const Row = s.obj({
  id: SpaceId,
  created_at_unix_ms: UnixMs,
  updated_at_unix_ms: UnixMs,
  deleted_at_unix_ms: s.maybe(UnixMs),
  model: s.or(s.str(), s.json),
})

export type Row = s.Infer<typeof Row>

const rowToSpace = (row: Row): Result<string, Space.Model> => {
  if (typeof row.model === 'string') {
    const json = Json.parse(row.model)
    if (isErr(json)) return Err('Failed to parse model as json')

    const space = Space.Model.parse(json.value)
    if (isErr(space)) {
      console.error(space.error)
      return Err('Failed to parse model as space')
    }

    return Ok(space.value)
  }

  const space = Space.Model.parse(row.model)
  if (isErr(space)) {
    console.error(space.error)
    return Err('Failed to parse model as space')
  }

  return Ok(space.value)
}

const QUERY_GET = `
SELECT 
  id, 
  created_at_unix_ms,
  updated_at_unix_ms,
  deleted_at_unix_ms,
  model
FROM space
WHERE id IN (:space_ids)
`

const QUERY_UPSERT = `
INSERT INTO space (id, created_at_unix_ms, updated_at_unix_ms, model)
VALUES (:id, :created_at_unix_ms, :updated_at_unix_ms, :model)
ON CONFLICT (id) DO UPDATE SET
  created_at_unix_ms = :created_at_unix_ms,
  updated_at_unix_ms = :updated_at_unix_ms,
  model = :model
`

const QUERY_CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS space (
  id TEXT PRIMARY KEY,
  created_at_unix_ms INT NOT NULL,
  updated_at_unix_ms INT NOT NULL,
  deleted_at_unix_ms INT,
  model TEXT NOT NULL
)
`

export const SpaceDb = async (config: Config): Promise<ISpaceDb> => {
  unwrap(
    await config.sqlDb.query({
      schema: s.unknown,
      sql: QUERY_CREATE_TABLE,
      vars: {},
    }),
  )

  return {
    async get(input) {
      const result = await config.sqlDb.query({
        schema: Row,
        sql: QUERY_GET,
        vars: { space_ids: Sql.commas(input) },
      })

      if (isErr(result)) return result

      const parsed = Result.combine(result.value.map((row) => rowToSpace(row)))

      return parsed
    },
    async upsert(space) {
      const stringified = Json.stringify(space)
      if (isErr(stringified)) return stringified

      const spaceId = Space.toSpaceId(space)
      if (!spaceId) return Err('Failed to derive spaceId from space')

      const result = await config.sqlDb.query({
        schema: s.unknown,
        sql: QUERY_UPSERT,
        vars: {
          id: spaceId,
          created_at_unix_ms: UnixMs.now(),
          updated_at_unix_ms: UnixMs.now(),
          model: stringified.value,
        },
      })

      if (isErr(result)) return result

      return Ok(null)
    },
  }
}
