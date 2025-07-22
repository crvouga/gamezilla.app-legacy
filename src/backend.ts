import { AppBackend } from '~/app/backend'
import { DotEnv } from './@/dotenv/dotenv'
import { FileSystem } from './@/file-system'
import { Logger } from './@/logger'
import { isErr } from './@/result'
import { SecretString } from './@/secrets/secret-string'
import { SqlDbMigration } from './@/sql-db-migrations/impl'
import { BackendSqlDb } from './@/sql-db/backend-impl'

const main = async () => {
  const logger = Logger.init({ t: 'console', namespace: ['backend'], newLinePerMsg: false, maxLogLevel: 'info' })

  logger.info('Starting backend')

  logger.info('Loading environment variables from .env file')
  await DotEnv.load({ fs: FileSystem.init({ t: 'node' }), paths: ['.env'] })
  logger.info('Environment variables loaded')

  const BACKEND_PORT = Number(process.env.BACKEND_PORT)
  if (isNaN(BACKEND_PORT)) throw new Error('BACKEND_PORT is not set')

  const TOPIC_URL = process.env.TOPIC_URL
  if (!TOPIC_URL) throw new Error('TOPIC_URL is not set')

  const DATABASE_URL = SecretString.init('DATABASE_URL', process.env.DATABASE_URL)
  if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')

  const IS_PROD = process.env.NODE_ENV?.includes('production') ?? false

  const sqlDb = BackendSqlDb.init({ t: 'postgres', databaseUrl: DATABASE_URL, logger })

  const sqlDbMigration = SqlDbMigration.init({
    t: 'dbmate',
    databaseUrl: DATABASE_URL,
    logger,
    sqlDb,
  })

  const migrated = await sqlDbMigration.up()
  if (isErr(migrated)) throw new Error(migrated.error)

  const ctx = await AppBackend.initCtx({
    isProd: IS_PROD,
    port: BACKEND_PORT,
    topicUrl: TOPIC_URL,
    sqlDb,
    logger,
  })

  const abortController = new AbortController()

  await AppBackend.worker(abortController.signal, { ctx })
}

main()
