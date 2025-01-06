import { describe, expect, test } from 'bun:test'
import { Logger } from '~/@/logger'
import { Flow } from '../..'
import { FlowGridShorthand } from '../../../variant/grid'
import * as FlowAlgoSolveAsync from './algo-solve-async'

describe(import.meta.file, () => {
  test('solve flow', async () => {
    const flow = FlowGridShorthand.toGrid([
      ['A', 'B', 'C'],
      [' ', ' ', ' '],
      ['A', 'B', 'C'],
    ])

    const solution = await FlowAlgoSolveAsync.solve(
      flow,
      Logger({
        t: 'noop',
      }),
    )

    const expected = FlowGridShorthand.toGrid([
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
