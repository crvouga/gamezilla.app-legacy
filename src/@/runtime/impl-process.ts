import { ILogger, Logger } from '~/@/logger'
import { PubSub, sleep } from '../core'
import { IRuntime, RuntimeEvent } from './interface'
import { TimeSpan } from '../time/time-span'
import { Posix } from '../time/posix'

export type Config = {
  t: 'process'
  shutoffFGracePeriod: TimeSpan
  logger: ILogger
}

export const Runtime = (config: Config): IRuntime => {
  const logger = Logger.prefix('process', config.logger)

  const events = PubSub.create<RuntimeEvent>()

  const handleShutdown = async () => {
    logger.info('Shutting down...')
    await events.pub({ t: 'stopping', stoppedAt: Posix.now() })
    logger.info('Waiting for grace period...')
    await sleep(config.shutoffFGracePeriod)
    logger.info('Grace period over. Process exit')
    process.exit(0)
  }

  process.on('SIGINT', handleShutdown)
  process.on('SIGTERM', handleShutdown)

  return {
    events
  }
}
