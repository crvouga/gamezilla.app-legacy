import { exec } from 'child_process'
import { promisify } from 'util'
import { ILogger } from '../logger'
import { Err, isErr, Ok } from '../result'
import { s } from '../schema'
import { SecretString } from '../secrets/secret-string'
import { ISqlDb } from '../sql-db/interface'
import { ISqlDbMigration } from './interface'

export type ImplDbMate = {
  t: 'dbmate'
  databaseUrl: SecretString
  logger: ILogger
  sqlDb: ISqlDb
}

const init = (config: ImplDbMate): ISqlDbMigration => {
  const logger = config.logger.child(['dbmate'])
  logger.info('Initializing dbmate migration')

  return {
    async up() {
      try {
        logger.info('Starting database migration')
        const execPromise = promisify(exec)
        logger.info('Running dbmate up command')
        const databaseUrl = config.databaseUrl.dangerouslyReadValue()
        logger.info('Attempting to acquire database lock')
        const locked = await config.sqlDb.query({ schema: s.unknown, sql: `SELECT pg_advisory_lock(424242)`, vars: {} })
        if (isErr(locked)) {
          logger.error('Failed to lock database', { error: locked.error })
          return Err(locked.error)
        }
        logger.info('Successfully acquired database lock')

        logger.info('Executing dbmate up command')
        const { stdout, stderr } = await execPromise(`npx dbmate up`, {
          env: {
            ...process.env,
            DATABASE_URL: databaseUrl,
          },
        })
        logger.info('Dbmate command completed')

        logger.info('Attempting to release database lock')
        const unlocked = await config.sqlDb.query({
          schema: s.unknown,
          sql: `SELECT pg_advisory_unlock(424242)`,
          vars: {},
        })
        if (isErr(unlocked)) {
          logger.error('Failed to unlock database', { error: unlocked.error })
          return Err(unlocked.error)
        }
        logger.info('Successfully released database lock')

        if (stdout) {
          logger.info('Dbmate command output:')
          for (const line of stdout.split('\n')) {
            logger.info(line)
          }
          logger.info('Database migration completed successfully')
          return Ok(null)
        }

        if (stderr) {
          logger.error('Dbmate command errors:')
          for (const line of stderr.split('\n')) {
            logger.error(line)
          }
          return Err(stderr)
        }

        logger.info('Database migration completed with no output')
        return Ok(null)
      } catch (error) {
        logger.error('Database migration failed', { error: String(error) })
        return Err(String(error))
      }
    },
  }
}

export const ImplDbMate = {
  init,
}
