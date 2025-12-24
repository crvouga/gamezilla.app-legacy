import postgres from 'postgres'
import { SecretString } from '~/@/secrets/secret-string'
import type { ILogger } from '../logger/interface'
import { Sleep } from '../promise/sleep'
import { Ok } from '../result'
import { ImplStandardSql } from './impl-standard-sql'
import { assertNotMigratable, type ISqlDb } from './interface'

export type ImplPostgres = {
  t: 'postgres'
  databaseUrl: SecretString
  logger: ILogger
  simulateLatency?: Sleep
}

let postgresClientSingleton: postgres.Sql<{}>

const init = (config: ImplPostgres): ISqlDb => {
  const logger = config.logger.child(['postgres'])

  postgresClientSingleton ??= postgres(config.databaseUrl.dangerouslyReadValue(), {
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    max: 10,
    connection: {
      application_name: 'gamezilla-app',
    },
    debug: false,
    onnotice(notice) {
      logger.debug({ notice })
    },
    onclose(error) {
      logger.debug({ error: error, message: 'onclose' })
    },
  })

  const query = async <TRow>(rawSql: string): Promise<TRow[]> => {
    return postgresClientSingleton.unsafe(rawSql)
  }

  const impl = ImplStandardSql.init({ t: 'standard-sql', query, logger })

  const instance: ISqlDb = {
    ...impl,
    aggregate: {
      StringConcat: (column, separator) => `STRING_AGG(${column}, '${separator}')`,
    },
    async notify(channel, payload) {
      await postgresClientSingleton.notify(channel, payload)
      return Ok(null)
    },
    async listen(channel, callback) {
      const listening = await postgresClientSingleton.listen(channel, (payload) => {
        callback({
          channel: channel,
          payload: payload,
        })
      })

      return async () => {
        await listening.unlisten()
      }
    },
  }

  // CRITICAL: Postgres is a production database and must NEVER be migratable.
  // This assertion ensures that even if the implementation is accidentally modified
  // to return a migratable database, we will fail fast at initialization.
  assertNotMigratable(instance, 'the Postgres implementation')

  return instance
}

export const ImplPostgres = {
  init,
}
