import { ILogger } from '~/@/logger'
import { Sub } from '../sub'
import { IRuntime, RuntimeEvent } from './interface'

export type Config = {
  t: 'noop'
  logger?: ILogger
}

export const Runtime = (_config: Config): IRuntime => {
  const events = Sub.create<RuntimeEvent>()

  return {
    events,
  }
}
