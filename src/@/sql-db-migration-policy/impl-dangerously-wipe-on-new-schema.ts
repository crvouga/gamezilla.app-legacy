import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { IKeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { checkMigratableForMigration } from '~/@/sql-db/interface'
import { isErr } from '~/@/result'
import { s } from '~/@/schema'
import { ISqlDbMigrationPolicy } from './interface'

export type ImplDangerouslyWipeOnNewSchema = {
  t: 'dangerously-wipe-on-new-schema'
  kvDb: IKeyValueDb
  logger: ILogger
}

const Entry = s.obj({
  up: s.arr(s.str()),
  down: s.arr(s.str()),
})

type Entry = s.Infer<typeof Entry>

const hashSql = (sql: string[]) => {
  return btoa(deterministicJsonStringify(sql))
}

const init = (config: ImplDangerouslyWipeOnNewSchema): ISqlDbMigrationPolicy => {
  return {
    async execute(input) {
      const logger = input.logger.child(['dangerously-wipe-on-new-schema'])

      if (!checkMigratableForMigration(input.sqlDb, logger, 'dangerously-wipe-on-new-schema')) {
        return { t: 'skipped', reason: 'non-migratable-database' }
      }

      const logPayload = {
        up: input.up,
        down: input.down,
      }
      logger.debug('running migration policy', logPayload)
      const key = hashSql(input.up)
      const prevSchemaResult = await config.kvDb.get(key, Entry)
      if (isErr(prevSchemaResult)) {
        logger.error('failed to get previous schema', { error: prevSchemaResult.error })
        return { t: 'skipped', reason: 'never-run' }
      }
      const prevSchema = prevSchemaResult.value
      if (!prevSchema) {
        logger.debug('no previous schema. running up migration', logPayload)

        logger.debug('running down migration to ensure the up migration succeeds', logPayload)

        for (const down of input.down) {
          const downResult = await input.sqlDb.query({
            sql: down,
            schema: s.unknown,
            vars: {},
          })

          if (isErr(downResult)) {
            logger.error('failed to run down migration', { error: downResult.error })
            continue
          }
        }

        logger.debug('running up migration', logPayload)

        for (const up of input.up) {
          const upResult = await input.sqlDb.query({
            sql: up,
            schema: s.unknown,
            vars: {},
          })

          if (isErr(upResult)) {
            logger.error('failed to run up migration', { error: upResult.error })
            continue
          }
        }
        const entryNew: Entry = {
          up: input.up,
          down: input.down,
        }
        logger.debug('up migration complete. writing new schema', { input, entryNew })
        await config.kvDb.set(key, entryNew)
        logger.debug('new schema written', { input, entryNew })
        return { t: 'executed' }
      }

      const prevHash = hashSql(prevSchema.up)
      const newHash = hashSql(input.up)
      const didChange = prevHash !== newHash
      if (!didChange) {
        logger.debug('no change in schema. skipping.', logPayload)
        return { t: 'skipped', reason: 'schema-unchanged' }
      }

      logger.debug('schema changed. running down migration', logPayload)
      for (const down of prevSchema.down) {
        const downResult = await input.sqlDb.query({
          sql: down,
          schema: s.unknown,
          vars: {},
        })
        if (isErr(downResult)) {
          logger.error('failed to run down migration', { error: downResult.error })
          continue
        }
      }

      logger.debug('down migration complete. running up migration', logPayload)
      for (const up of input.up) {
        const upResult = await input.sqlDb.query({
          sql: up,
          schema: s.unknown,
          vars: {},
        })
        if (isErr(upResult)) {
          logger.error('failed to run up migration', { error: upResult.error })
          continue
        }
      }

      logger.debug('up migration complete. writing new schema', logPayload)
      const entryNew: Entry = {
        up: input.up,
        down: input.down,
      }
      await config.kvDb.set(key, entryNew)
      logger.debug('new schema written', { input, entryNew })
      return { t: 'executed' }
    },
  }
}

export const ImplDangerouslyWipeOnNewSchema = {
  init,
}
