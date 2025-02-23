import type { ILogger } from '~/@/logger'
import { Err, Ok, Result } from '~/@/result'
import type { Variant } from '../../variant'
import { MsgToMaster, type MsgToWorker } from './types'

export const solve = async (input: {
  model: Variant.Model
  logger: ILogger
}): Promise<Result<string, Variant.Model | null>> => {
  input.logger.info('Solving puzzle with worker')

  let url

  try {
    url = new URL('algo-solve-async-worker.ts', import.meta.url).href
  } catch (e) {
    console.error(e)
    return Err('Failed to load worker')
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

  const errorPromise = new Promise<string>((resolve) => {
    worker.onerror = (event: ErrorEvent) => {
      resolve(event.message)
    }
  })

  const toWorker: MsgToWorker = {
    t: 'find-solution',
    model: input.model,
  }

  input.logger.info('Sending solve request to worker')

  worker.postMessage(toWorker)

  input.logger.info('Waiting for solution')

  const result = await Promise.race([
    solutionPromise,
    errorPromise.then((err) => err).catch(() => ''),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 1000 * 60 * 2)
    }),
  ])

  if (typeof result === 'string') {
    return Err(result)
  }

  if (result === null) {
    return Err('Timed out. Worker took too long to respond')
  }

  input.logger.info(`Solution: ${result ? 'found' : 'not found'}`)

  input.logger.info('Terminating worker')

  worker.terminate()

  input.logger.info('Worker terminated')

  return Ok(result)
}
