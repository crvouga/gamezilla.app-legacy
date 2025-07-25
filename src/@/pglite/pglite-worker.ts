import { worker } from '@electric-sql/pglite/worker'
import { ImplMainThread } from './impl-main-thread'
import { PgliteConfig } from './types'

worker({
  async init(options) {
    const config: PgliteConfig = options.meta

    const pglite = await ImplMainThread.init({ t: 'main-thread', config })

    return pglite as any
  },
})
