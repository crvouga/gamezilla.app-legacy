import type { ILogger } from '~/@/logger'
import { Err, Ok, Result } from '~/@/result'
import type { NumberlinkVariant } from '../../variant'
import { AlgoSolve } from '../algo-solve'
import { MsgToMaster, type MsgToWorker } from './types'
import { TimeSpan } from '~/@/time/time-span'

export type SolveAsyncProblem =
  | {
      t: 'unknown'
      error: string
    }
  | {
      t: 'aborted'
    }
  | {
      t: 'timed-out'
    }
  | {
      t: 'failed-to-load-worker'
      error: string
    }

export const problemToString = (problem: SolveAsyncProblem): string => {
  switch (problem.t) {
    case 'unknown':
      return problem.error
    case 'aborted':
      return 'Aborted'
    case 'timed-out':
      return 'Timed out'
    case 'failed-to-load-worker':
      return problem.error
  }
}

export type SolveAsyncInput = {
  model: NumberlinkVariant.Model
  logger: ILogger
  maxDuration: TimeSpan
  abortSignal?: AbortSignal
}

type SolveAsync = (input: SolveAsyncInput) => Promise<Result<SolveAsyncProblem, NumberlinkVariant.Model | null>>

export const solve: SolveAsync = async (input) => {
  return solveWorker(input)
}

export const solveInProcess: SolveAsync = async (input) => {
  return Ok(AlgoSolve.solve(input.model))
}

export const solveWorker: SolveAsync = async (input) => {
  input.logger.info('Solving puzzle with worker')

  // Check if already aborted
  if (input.abortSignal?.aborted) {
    return Err({
      t: 'aborted',
    })
  }

  let url

  try {
    url = new URL('algo-solve-async-worker.ts', import.meta.url).href
  } catch (e) {
    console.error(e)
    return Err({
      t: 'failed-to-load-worker',
      error: e instanceof Error ? e.message : 'Unknown error',
    })
  }

  const worker = new Worker(url)

  const solutionPromise = new Promise<NumberlinkVariant.Model | null>((resolve) => {
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

  const abortPromise = new Promise<'aborted'>((resolve) => {
    if (input.abortSignal) {
      input.abortSignal.addEventListener('abort', () => {
        resolve('aborted')
      })
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
    errorPromise.then((err) => err).catch(() => 'error' as const),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), TimeSpan.toMilliseconds(input.maxDuration))
    }),
    abortPromise,
  ])

  if (result === 'aborted') {
    input.logger.info('Solving aborted')
    worker.terminate()
    return Err({
      t: 'aborted',
    })
  }

  if (typeof result === 'string') {
    worker.terminate()
    return Err({
      t: 'unknown',
      error: result,
    })
  }

  if (result === null) {
    worker.terminate()
    return Err({
      t: 'timed-out',
    })
  }

  input.logger.info(`Solution: ${result ? 'found' : 'not found'}`)

  input.logger.info('Terminating worker')

  worker.terminate()

  input.logger.info('Worker terminated')

  return Ok(result)
}
