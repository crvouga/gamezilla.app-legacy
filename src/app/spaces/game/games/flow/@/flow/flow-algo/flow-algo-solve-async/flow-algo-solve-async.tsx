import type { ILogger } from '~/@/logger'
import { loggerNoop } from '~/@/logger/impl-noop'
import type { Variant } from '../../flow-variant'
import { MsgToMaster, type MsgToWorker } from './flow-algo-solve-async.types'

export const solve = async (model: Variant.Model, logger: ILogger = loggerNoop): Promise<Variant.Model | null> => {
  logger.info('Solving puzzle with worker')

  let url

  try {
    url = new URL('flow-algo-solve-async.worker.ts', import.meta.url).href
  } catch (e) {
    console.error(e)
    return null
  }

  const worker = new Worker(url)

  const solutionPromise = new Promise<Variant.Model | null>((resolve) => {
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
    model,
  }

  logger.info('Sending solve request to worker')

  worker.postMessage(toWorker)

  logger.info('Waiting for solution')

  const solution = await Promise.race([
    solutionPromise,
    new Promise<Variant.Model | null>((resolve) => {
      setTimeout(
        () => {
          resolve(null)
        },
        1000 * 60 * 2,
      )
    }),
  ])

  logger.info(`Solution: ${solution ? 'found' : 'not found'}`)

  logger.info('Terminating worker')

  worker.terminate()

  logger.info('Worker terminated')

  return solution
}
