import { describe, expect, test } from 'bun:test'
import { Logger } from '~/@/logger'
import { Flow } from '../../flow'
import { VariantGridShorthand } from '../../variant/grid'
import * as AlgoSolveAsync from './algo-solve-async'

describe(import.meta.file, () => {
  test('solve flow', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', 'B', 'C'],
      [' ', ' ', ' '],
      ['A', 'B', 'C'],
    ])

    const solution = await AlgoSolveAsync.solve(
      flow,
      Logger({
        t: 'noop',
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
})
