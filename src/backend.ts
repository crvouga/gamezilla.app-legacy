import { AppBackend } from '~/app/backend'
import { DotEnv } from './@/dotenv/dotenv'
import { FileSystem } from './@/file-system'
import { Logger } from './@/logger'
import { SecretString } from './@/secrets/secret-string'
import { SqlDbMigration } from './@/sql-db-migrations/impl'
import { BackendSqlDb } from './@/sql-db/backend-impl'
import { Url } from './@/url/url'

const main = async () => {
  const logger = Logger.init({ t: 'console', namespace: ['backend'], newLinePerMsg: false, maxLogLevel: 'debug' })

  logger.info('Starting backend')

  logger.info('Loading environment variables from .env file')
  await DotEnv.load({
    fs: FileSystem.init({ t: 'node' }),
    paths: ['.env'],
    precedence: 'preserve-process-env',
  })
  logger.info('Environment variables loaded')

  logger.info('Loading configuration from environment')
  const BACKEND_PORT = Number(process.env.BACKEND_PORT)
  if (isNaN(BACKEND_PORT)) throw new Error('BACKEND_PORT is not set')
  logger.info(`Backend port set to ${BACKEND_PORT}`)

  const TOPIC_URL = process.env.TOPIC_URL
  if (!TOPIC_URL) throw new Error('TOPIC_URL is not set')
  logger.info(`Topic URL set to ${TOPIC_URL}`)

  const BACKEND_URL = process.env.BACKEND_URL
  if (!BACKEND_URL) throw new Error('BACKEND_URL is not set')
  logger.info(`Backend URL set to ${BACKEND_URL}`)

  const DATABASE_URL = SecretString.init('DATABASE_URL', process.env.DATABASE_URL)
  if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')
  logger.info('Database URL loaded')

  const IS_PROD = process.env.NODE_ENV?.includes('production') ?? false
  logger.info(`Running in ${IS_PROD ? 'production' : 'development'} mode`)

  logger.info('Initializing database connection')
  const sqlDb = BackendSqlDb.init({ t: 'postgres', databaseUrl: DATABASE_URL, logger })
  logger.info('Database connection initialized')

  logger.info('Running database migrations')
  const sqlDbMigration = SqlDbMigration.init({ t: 'dbmate', databaseUrl: DATABASE_URL, logger, sqlDb })
  await sqlDbMigration.up()
  logger.info('Database migrations completed')

  const backendUrl = Url.derive(BACKEND_URL, IS_PROD ? 'https' : 'http')
  logger.info(`Backend URL set to ${backendUrl}`)

  const topicUrl = Url.derive(TOPIC_URL, IS_PROD ? 'https' : 'http')
  logger.info(`Topic URL set to ${topicUrl}`)

  logger.info('Initializing backend context')
  const ctx = await AppBackend.initCtx({
    isProd: IS_PROD,
    port: BACKEND_PORT,
    backendUrl,
    topicUrl,
    sqlDb,
    logger,
  })
  logger.info('Backend context initialized')

  const abortController = new AbortController()

  logger.info('Starting backend worker')
  await AppBackend.worker(abortController.signal, { ctx })
}

main()
