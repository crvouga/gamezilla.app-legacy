import postgres from 'postgres'
import { SecretString } from '~/@/secrets/secret-string'
import type { ILogger } from '../logger/interface'
import { Sleep } from '../promise/sleep'
import { Ok } from '../result'
import { ImplStandardSql } from './impl-standard-sql'
import type { ISqlDb } from './interface'

export type ImplPostgres = {
  t: 'postgres'
  databaseUrl: SecretString
  logger: ILogger
  simulateLatency?: Sleep
}

let postgresClient: postgres.Sql<{}>

const init = (config: ImplPostgres): ISqlDb => {
  const logger = config.logger.child(['postgres'])

  postgresClient ??= postgres(config.databaseUrl.dangerouslyReadValue(), {
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
      logger.error({ error: error, message: 'onclose' })
    },
  })

  const query = async <TRow>(rawSql: string): Promise<TRow[]> => {
    return postgresClient.unsafe(rawSql)
  }

  const impl = ImplStandardSql.init({
    t: 'standard-sql',
    query,
    logger: config.logger,
  })

  return {
    ...impl,
    aggregate: {
      StringConcat: (column, separator) => `STRING_AGG(${column}, '${separator}')`,
    },
    notify: async (channel, payload) => {
      await postgresClient.notify(channel, payload)
      return Ok(null)
    },
    listen: async (channel, callback) => {
      const listening = await postgresClient.listen(channel, (payload) => {
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
}

export const ImplPostgres = {
  init,
}
