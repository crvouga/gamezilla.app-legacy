import { Logger } from '~/@/logger'
import * as ImplNoop from './impl-noop'
import * as ImplProcess from './impl-process'
import { IRuntime } from './interface'

export type Config = ImplProcess.Config | ImplNoop.Config

export const Runtime = (config: Config): IRuntime => {
  const logger = (config.logger ?? Logger.init({ t: 'noop' })).child(['runtime'])
  switch (config.t) {
    case 'noop': {
      return ImplNoop.Runtime({ ...config, logger })
    }
    case 'process': {
      return ImplProcess.Runtime({ ...config, logger })
    }
  }
}
