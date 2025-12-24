import { AppBackend } from '~/app/backend'
import { DotEnv } from './@/dotenv/dotenv'
import { FileSystem } from './@/file-system'
import { Logger } from './@/logger'
import { SecretString } from './@/secrets/secret-string'
import { BackendSqlDb } from './@/sql-db/backend-impl'
import { assertNotMigratable, validateProductionDatabaseUrl } from './@/sql-db/interface'

const main = async () => {
  const logger = Logger.init({ t: 'console', namespace: ['server'], newLinePerMsg: false, maxLogLevel: 'debug' })

  logger.info('Starting server')

  logger.info('Loading environment variables from .env file')
  await DotEnv.load({
    logger,
    fs: FileSystem.init({ t: 'node' }),
    paths: ['.env'],
    precedence: 'preserve',
    cwd: process.cwd(),
    env: process.env,
  })
  logger.info('Environment variables loaded')

  const DATABASE_URL = SecretString.init('DATABASE_URL', process.env.DATABASE_URL)
  if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')
  logger.info('Database URL loaded')

  const IS_PROD = process.env.NODE_ENV?.includes('production') ?? false
  logger.info(`Running in ${IS_PROD ? 'production' : 'development'} mode`)

  // CRITICAL: Validate database URL before initializing connection
  // This provides an early warning if production URL points to localhost
  if (IS_PROD) {
    validateProductionDatabaseUrl(DATABASE_URL, 'backend.rpc.ts entry point')
  }

  logger.info('Initializing database connection')
  const sqlDb = BackendSqlDb.init({ t: 'postgres', databaseUrl: DATABASE_URL, logger })

  // CRITICAL: Additional validation at entry point
  // This is a redundant check to ensure Postgres is never migratable
  assertNotMigratable(sqlDb, 'backend.rpc.ts entry point after BackendSqlDb.init')

  logger.info('Database connection initialized')

  logger.info('Loading server port from environment')
  const SERVER_PORT = 5002
  logger.info(`Server port set to ${SERVER_PORT}`)

  logger.info('Initializing backend context')
  const ctx = await AppBackend.initCtx({
    isProd: IS_PROD,
    port: SERVER_PORT,
    sqlDb,
    logger,
  })
  logger.info('Server context initialized')

  logger.info('Starting server')
  await AppBackend.server({ ctx })
}

main()
