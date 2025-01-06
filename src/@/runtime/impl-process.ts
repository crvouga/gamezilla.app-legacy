import { ILogger, Logger } from '~/@/logger'
import { PubSub } from '../sub'
import { sleep } from '../promise/sleep'
import { Posix } from '../time/posix'
import { TimeSpan } from '../time/time-span'
import { IRuntime, RuntimeEvent } from './interface'

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
    events,
  }
}
