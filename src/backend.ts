import { AppBackend } from '~/app/backend'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from './config/shared'

const main = async () => {
  const ctx = await AppBackend.initCtx({ sqlDb: 'postgres' })

  const abortController = new AbortController()
  AppBackend.worker(abortController.signal, { ctx })

  ctx.logger.info({ ...CONFIG_SHARED, ...CONFIG_BACKEND })
}

main()
