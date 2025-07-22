import { exec } from 'child_process'
import { promisify } from 'util'
import { ILogger } from '../logger'
import { Err, Ok } from '../result'
import { SecretString } from '../secrets/secret-string'
import { ISqlDbMigration } from './interface'

export type ImplDbMate = {
  t: 'dbmate'
  databaseUrl: SecretString
  logger: ILogger
}

const init = (config: ImplDbMate): ISqlDbMigration => {
  const logger = config.logger.child(['dbmate'])
  return {
    async up() {
      try {
        logger.info('Starting database migration')
        const execPromise = promisify(exec)
        logger.info('Running dbmate up command')
        const databaseUrl = config.databaseUrl.dangerouslyReadValue()
        const { stdout, stderr } = await execPromise(`npx dbmate up`, {
          env: {
            ...process.env,
            DATABASE_URL: databaseUrl,
          },
        })

        if (stdout) {
          logger.info('stdout:')
          for (const line of stdout.split('\n')) {
            logger.info(line)
          }
          logger.info('Database migration completed successfully')
          return Ok(null)
        }

        if (stderr) {
          logger.error('stderr:')
          for (const line of stderr.split('\n')) {
            logger.error(line)
          }
          return Err(stderr)
        }

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
