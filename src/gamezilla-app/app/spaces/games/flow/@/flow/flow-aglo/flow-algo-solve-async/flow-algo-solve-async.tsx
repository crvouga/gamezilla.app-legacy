import type { ILogger } from 'gamezilla-app/app/@/server/logger'
import { loggerNoop } from 'gamezilla-app/app/@/server/logger/impl-noop'
import type { FlowVariant } from '../../flow-variant'
import { MsgToMaster, type MsgToWorker } from './flow-algo-solve-async.types'

export const solve = async (
  model: FlowVariant.Model,
  logger: ILogger = loggerNoop
): Promise<FlowVariant.Model | null> => {
  logger.info('Solving puzzle with worker')

  const url = new URL('flow-algo-solve-async.worker.ts', import.meta.url).href

  const worker = new Worker(url)

  const solutionPromise = new Promise<FlowVariant.Model | null>((resolve) => {
    worker.onmessage = (event: MessageEvent<unknown>) => {
      const parsed = MsgToMaster.parse(event.data)
      if (parsed.t === 'err') {
        return
      }
      switch (parsed.value.t) {
        case 'found-solution': {
          resolve(parsed.value.model ?? null)
          return
        }
      }
    }
  })

  const toWorker: MsgToWorker = {
    t: 'find-solution',
    model
  }

  logger.info('Sending solve request to worker')

  worker.postMessage(toWorker)

  logger.info('Waiting for solution')

  const solution = await Promise.race([
    solutionPromise,
    new Promise<FlowVariant.Model | null>((resolve) => {
      setTimeout(() => {
        resolve(null)
      }, 1000 * 60 * 2)
    })
  ])

  logger.info(`Solution: ${solution ? 'found' : 'not found'}`)

  logger.info('Terminating worker')

  worker.terminate()

  logger.info('Worker terminated')

  return solution
}
