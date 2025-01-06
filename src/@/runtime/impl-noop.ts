import { ILogger } from '~/@/logger'
import { PubSub } from '../sub'
import { IRuntime, RuntimeEvent } from './interface'

export type Config = {
  t: 'noop'
  logger?: ILogger
}

export const Runtime = (_config: Config): IRuntime => {
  const events = PubSub.create<RuntimeEvent>()

  return {
    events,
  }
}
