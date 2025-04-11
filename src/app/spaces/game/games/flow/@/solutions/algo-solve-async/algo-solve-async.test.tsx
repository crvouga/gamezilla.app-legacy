import { describe, expect, test } from 'bun:test'
import { loggerNoop } from '~/@/logger/impl-noop'
import { isErr, unwrap } from '~/@/result'
import { Flow } from '../../flow'
import { VariantGridShorthand } from '../../variant/grid'
import * as AlgoSolveAsync from './algo-solve-async'
import { TimeSpan } from '~/@/time/time-span'

describe('AlgoSolveAsync', () => {
  test('solve flow', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', 'B', 'C'],
      [' ', ' ', ' '],
      ['A', 'B', 'C'],
    ])

    const solution = unwrap(
      await AlgoSolveAsync.solve({
        model: flow,
        logger: loggerNoop,
        maxDuration: TimeSpan.seconds(10),
      }),
    )

    const expected = VariantGridShorthand.toGrid([
      ['A', 'B', 'C'],
      ['a', 'b', 'c'],
      ['A', 'B', 'C'],
    ])

    expect(solution).toBeTruthy()
    if (solution) {
      expect(Flow.isSame(solution, expected)).toBe(true)
    }
  })

  test('abort', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      ['I', ' ', ' ', ' ', ' ', ' ', ' ', 'J'],
      ['K', ' ', 'L', 'M', 'N', 'O', ' ', 'P'],
      ['Q', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ])

    const abortController = new AbortController()

    const solvePromise = AlgoSolveAsync.solve({
      model: flow,
      logger: loggerNoop,
      maxDuration: TimeSpan.seconds(10),
      abortSignal: abortController.signal,
    })

    abortController.abort()

    const result = await solvePromise

    expect(result.t).toBe('err')
    if (isErr(result)) expect(result.error.t).toBe('aborted')
  })
})
