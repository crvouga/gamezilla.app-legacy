import type { ILogger } from '~/@/logger'
import type { Variant } from '../../variant'
import { MsgToMaster, type MsgToWorker } from './algo-solve-async.types'

export const solve = async (input: { model: Variant.Model; logger: ILogger }): Promise<Variant.Model | null> => {
  input.logger.info('Solving puzzle with worker')

  let url

  try {
    url = new URL('algo-solve-async-worker.ts', import.meta.url).href
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
    model: input.model,
  }

  input.logger.info('Sending solve request to worker')

  worker.postMessage(toWorker)

  input.logger.info('Waiting for solution')

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

  input.logger.info(`Solution: ${solution ? 'found' : 'not found'}`)

  input.logger.info('Terminating worker')

  worker.terminate()

  input.logger.info('Worker terminated')

  return solution
}
