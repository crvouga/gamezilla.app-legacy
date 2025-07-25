import { live } from '@electric-sql/pglite/live'
import { PGliteWorker } from '@electric-sql/pglite/worker'
import PGWorker from './pglite-worker.js?worker'
import { IPglite, PgliteConfig } from './types'

export type ImplWorkerThread = {
  t: 'worker-thread'
  config: PgliteConfig
}

const init = async (config: ImplWorkerThread): Promise<IPglite> => {
  const pglite = new PGliteWorker(
    new PGWorker({
      // @ts-ignore
      type: 'module',
      name: 'pglite-worker',
    }),
    {
      meta: config.config,
      extensions: {
        live,
      },
    },
  )

  // @ts-ignore
  return pglite
}

export const ImplWorkerThread = {
  init,
}
