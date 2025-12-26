import { Json } from '~/@/json/json'
import { ILogger } from '~/@/logger'
import { Err, isErr, Ok } from '~/@/result'
import { s } from '~/@/schema'
import { ParseError } from '~/@/schema/schema/parse-error'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import { ISqlDb } from '~/@/sql-db/interface'
import { UnixMs } from '~/@/time/unix-ms'
import { ServerRegistryRecord } from '../server-registry-record'
import { IServerRegistryRecordDb } from './interface'

export type ImplSqlDb = {
  t: 'sql-db'
  sqlDb: ISqlDb
  logger: ILogger
  migrationPolicy: ISqlDbMigrationPolicy
}

const UP: string[] = [
  `
  CREATE TABLE IF NOT EXISTS server_registry (
    id TEXT NOT NULL PRIMARY KEY,
    data_json TEXT NOT NULL,
    inserted_at_unix_ms BIGINT NOT NULL
  );
  `,
]

const DOWN: string[] = [
  `
  DROP TABLE IF EXISTS server_registry;
  `,
]

const Row = s.obj({
  id: s.str(),
  data_json: s.str(),
  inserted_at_unix_ms: s.or(s.num(), s.str()),
})

const MAX_ROWS = 100

const init = (self: ImplSqlDb): IServerRegistryRecordDb => {
  self.migrationPolicy.execute({ sqlDb: self.sqlDb, up: UP, down: DOWN, logger: self.logger })
  return {
    async get() {
      const queried = await self.sqlDb.query({
        schema: Row,
        sql: 'SELECT id, data_json, inserted_at_unix_ms FROM server_registry ORDER BY inserted_at_unix_ms DESC LIMIT 1',
        vars: {},
      })
      if (isErr(queried)) return queried
      const row = queried.value[0]
      if (!row) return Ok({ servers: [] })
      const json = Json.parse(row.data_json)
      if (isErr(json)) return Err(`Failed to parse server registry: ${json.error}`)
      const parsed = ServerRegistryRecord.schema.parse(json.value)
      if (isErr(parsed)) {
        return Err(`Failed to parse server registry: ${ParseError.toString(parsed.error)}`)
      }
      return Ok(parsed.value)
    },
    async insert(serverRegistryId, serverRegistry) {
      const json = Json.stringify(serverRegistry)
      if (isErr(json)) return Err(`Failed to stringify server registry: ${json.error}`)
      const result = await self.sqlDb.query({
        schema: Row,
        sql: 'INSERT INTO server_registry (id, data_json, inserted_at_unix_ms) VALUES (:id, :data_json, :inserted_at_unix_ms)',
        vars: {
          id: serverRegistryId,
          data_json: json.value,
          inserted_at_unix_ms: UnixMs.now(),
        },
      })
      if (isErr(result)) return result
      return Ok(null)
    },
    async cleanUp() {
      self.logger.debug('Cleaning up server registry cache')
      const cleaned = await self.sqlDb.query({
        schema: s.unknown,
        sql: `
        WITH latest AS (
          SELECT id FROM server_registry 
          ORDER BY inserted_at_unix_ms DESC 
          LIMIT :limit
        )
        DELETE FROM server_registry 
        WHERE id NOT IN (SELECT id FROM latest)`,
        vars: {
          limit: MAX_ROWS,
        },
      })
      if (isErr(cleaned)) return cleaned
      return Ok(null)
    },
  }
}

export const ImplSqlDb = {
  init,
}
