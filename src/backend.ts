import { AppBackend } from '~/app/backend'
import { DotEnv } from './@/dotenv/dotenv'
import { FileSystem } from './@/file-system'
import { SecretString } from './@/secrets/secret-string'

const main = async () => {
  await DotEnv.load({ fs: FileSystem({ t: 'node' }), paths: ['.env'] })

  const BACKEND_PORT = Number(process.env.BACKEND_PORT)
  if (isNaN(BACKEND_PORT)) {
    throw new Error('BACKEND_PORT is not set')
  }

  const TOPIC_URL = process.env.TOPIC_URL
  if (!TOPIC_URL) throw new Error('TOPIC_URL is not set')

  const DATABASE_URL = SecretString.init('DATABASE_URL', process.env.DATABASE_URL)
  if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')

  const IS_PROD = process.env.NODE_ENV === 'production'

  const CORS_ORIGINS: string[] = []
  if (!IS_PROD) {
    CORS_ORIGINS.push('http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://frontend:5173')
  }

  if (IS_PROD) {
    CORS_ORIGINS.push('https://www.gamezilla.app')
  }

  const ctx = await AppBackend.initCtx({
    port: BACKEND_PORT,
    topicUrl: TOPIC_URL,
    databaseUrl: DATABASE_URL,
    corsOrigins: CORS_ORIGINS,
    isProd: IS_PROD,
  })

  const abortController = new AbortController()

  AppBackend.worker(abortController.signal, { ctx })
}

main()
