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

const ADVISORY_LOCK_ID = 424242

const init = (config: ImplDbMate): ISqlDbMigration => {
  const logger = config.logger.child(['dbmate'])
  logger.info('Initializing dbmate migration')

  return {
    async up() {
      let locked = false
      try {
        const lockRes = await config.sqlDb.query({
          schema: s.unknown,
          sql: `SELECT pg_advisory_lock(${ADVISORY_LOCK_ID})`,
          vars: {},
        })
        if (isErr(lockRes)) {
          logger.error('Failed to lock database', { error: lockRes.error })
          return Err(lockRes.error)
        }
        locked = true
        logger.info('Successfully acquired database lock')

        const { stdout, stderr } = await promisify(exec)('pnpm exec dbmate up', {
          env: {
            ...process.env,
            DATABASE_URL: config.databaseUrl.dangerouslyReadValue(),
          },
        })

        if (stdout) {
          for (const line of stdout.split('\n')) logger.info(line)
        }

        if (stderr) {
          for (const line of stderr.split('\n')) logger.error(line)
          return Err(stderr)
        }

        return Ok(null)
      } catch (error) {
        logger.error('Database migration failed', { error: String(error) })
        return Err(String(error))
      } finally {
        if (locked) {
          const unlockRes = await config.sqlDb.query({
            schema: s.unknown,
            sql: `SELECT pg_advisory_unlock(${ADVISORY_LOCK_ID})`,
            vars: {},
          })
          if (isErr(unlockRes)) {
            logger.error('Failed to unlock database', { error: unlockRes.error })
          } else {
            logger.info('Successfully released database lock')
          }
        }
      }
    },
  }
}

export const ImplDbMate = {
  init,
}
