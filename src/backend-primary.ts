import { AppBackend } from '~/app/backend'
import { CONFIG_BACKEND } from '~/config/backend'
import { DotEnv } from './@/dotenv/dotenv'
import { FileSystem } from './@/file-system'
import { CONFIG_SHARED } from './config/shared'

const main = async () => {
  await DotEnv.load({ fs: FileSystem({ t: 'node' }), paths: ['.env.local', '.env'] })

  console.table({ ...CONFIG_SHARED, ...CONFIG_BACKEND })

  const ctx = await AppBackend.initCtx({ backendRole: 'primary' })

  const abortController = new AbortController()

  AppBackend.worker(abortController.signal, { ctx })
}

main()
