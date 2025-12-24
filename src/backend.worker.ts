import { AppBackend } from '~/app/backend'
import { DotEnv } from './@/dotenv/dotenv'
import { FileSystem } from './@/file-system'
import { Logger } from './@/logger'
import { SecretString } from './@/secrets/secret-string'
import { BackendSqlDb } from './@/sql-db/backend-impl'

const main = async () => {
  const logger = Logger.init({ t: 'console', namespace: ['worker'], newLinePerMsg: false, maxLogLevel: 'debug' })

  logger.info('Starting worker')

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

  logger.info('Initializing database connection')
  const sqlDb = BackendSqlDb.init({ t: 'postgres', databaseUrl: DATABASE_URL, logger })
  logger.info('Database connection initialized')

  logger.info('Loading worker port from environment')
  const WORKER_PORT = 5002
  logger.info(`Worker port set to ${WORKER_PORT}`)

  logger.info('Initializing backend context')
  const ctx = await AppBackend.initCtx({
    isProd: IS_PROD,
    port: WORKER_PORT,
    sqlDb,
    logger,
  })
  logger.info('Worker context initialized')

  const abortController = new AbortController()

  logger.info('Starting worker')
  await AppBackend.worker(abortController.signal, { ctx })
}

main()
