import { describe, expect, test } from 'bun:test'
import { loggerNoop } from '~/@/logger/impl-noop'
import { unwrap } from '~/@/result'
import { Flow } from '../../flow'
import { VariantGridShorthand } from '../../variant/grid'
import * as AlgoSolveAsync from './algo-solve-async'

describe('AlgoSolveAsync', () => {
  test('solve flow', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', 'B', 'C'],
      [' ', ' ', ' '],
      ['A', 'B', 'C'],
    ])

    const solution = unwrap(await AlgoSolveAsync.solve({ model: flow, logger: loggerNoop }))

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
})
