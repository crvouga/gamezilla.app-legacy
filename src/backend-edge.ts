import { AppBackend } from '~/app/backend'
import { CONFIG_BACKEND } from '~/config/backend'
import { DotEnv } from './@/dotenv/dotenv'
import { FileSystem } from './@/file-system'
import { CONFIG_SHARED } from './config/shared'

const main = async () => {
  await DotEnv.load({ fs: FileSystem({ t: 'node' }), paths: ['.env'] })

  console.log({ ...CONFIG_SHARED, ...CONFIG_BACKEND })

  const ctx = await AppBackend.initCtx({ backendRole: 'edge', port: CONFIG_BACKEND.PORT() })

  const abortController = new AbortController()

  AppBackend.worker(abortController.signal, { ctx })
}

main()
