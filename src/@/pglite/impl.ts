import { ImplMainThread } from './impl-main-thread'
import { ImplWorkerThread } from './impl-worker-thread'
import { IPglite } from './types'

export type Pglite = ImplMainThread | ImplWorkerThread

const init = async (config: Pglite): Promise<IPglite> => {
  switch (config.t) {
    case 'main-thread':
      return ImplMainThread.init(config)
    case 'worker-thread':
      return ImplWorkerThread.init(config)
  }
}

export const Pglite = {
  init,
}
