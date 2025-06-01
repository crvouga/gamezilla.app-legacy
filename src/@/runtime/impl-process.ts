import { ILogger, Logger } from '~/@/logger'
import { sleep } from '~/@/promise/sleep'
import { IRuntime, RuntimeEvent } from '~/@/runtime/interface'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'

export type Config = {
  t: 'process'
  shutoffFGracePeriod: TimeSpan
  logger: ILogger
}

export const Runtime = (config: Config): IRuntime => {
  const logger = Logger.prefix('process', config.logger)

  const events = Sub.create<RuntimeEvent>()

  const handleShutdown = async () => {
    logger.info('Shutting down...')
    await events.pub({ t: 'runtime/stopping', stoppedAt: Posix.now() })
    logger.info('Waiting for grace period...')
    await sleep(config.shutoffFGracePeriod)
    logger.info('Grace period over. Process exit')
    process.exit(0)
  }

  const SHOULD = false
  if (SHOULD) {
    process.on('SIGINT', handleShutdown)
    process.on('SIGTERM', handleShutdown)
  }

  return {
    events,
  }
}
